// Gemini (Google AI Studio) backend for the assistant, via plain REST.
// Uses the same TOOLS / executeTool as the Claude backend.
import { TOOLS, executeTool } from "@/lib/ai/tools";

// Ordered model chain: the first is preferred; if it is slow/overloaded the next is tried.
// Override with GEMINI_MODEL (single) or GEMINI_MODELS (comma-separated).
const DEFAULT_CHAIN = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"];
function clean(m: string): string {
  return m.trim().replace(/^["']|["']$/g, "").replace(/^models\//, "");
}
function resolveModels(): string[] {
  const raw = process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "";
  const list = raw.split(",").map(clean).filter((m) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(m));
  return list.length ? list : DEFAULT_CHAIN;
}
const MODELS = resolveModels();
const MAX_TOOL_ROUNDS = 8;

type Part = {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: unknown };
  [k: string]: unknown;
};
type Content = { role: "user" | "model"; parts: Part[] };

// Gemini accepts an OpenAPI-style subset of JSON Schema.
function cleanSchema(s: unknown): unknown {
  if (Array.isArray(s)) return s.map(cleanSchema);
  if (s && typeof s === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(s as Record<string, unknown>)) {
      if (k === "additionalProperties" || k === "$schema" || k === "default") continue;
      out[k] = cleanSchema(v);
    }
    return out;
  }
  return s;
}

const FUNCTION_DECLARATIONS = TOOLS.map((t) => {
  const schema = cleanSchema(t.input_schema) as { properties?: Record<string, unknown> };
  const hasProps = schema.properties && Object.keys(schema.properties).length > 0;
  return {
    name: t.name,
    description: t.description ?? "",
    ...(hasProps ? { parameters: schema } : {}),
  };
});

export async function runGemini(opts: {
  system: string;
  history: { role: "user" | "assistant"; content: string }[];
  message: string;
  userId: string;
}): Promise<{ finalText: string; actionsTaken: { tool: string; result: unknown }[] }> {
  const key = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!key) throw new Error("GEMINI_API_KEY is not set.");

  const contents: Content[] = [
    ...opts.history.map((h): Content => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text: opts.message }] },
  ];

  const deadline = Date.now() + 48_000; // route allows 60s; stay under it
  const actionsTaken: { tool: string; result: unknown }[] = [];
  let finalText = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    // Try each model in the chain; a slow/overloaded model falls through to the next.
    let res: Response | undefined;
    outer: for (const model of MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const remaining = deadline - Date.now();
        if (remaining < 3000) throw new Error("The assistant took too long to answer. Please try again.");
        try {
          res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": key },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: opts.system }] },
                contents,
                tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
                generationConfig: { maxOutputTokens: 2048 },
              }),
              signal: AbortSignal.timeout(Math.min(14_000, remaining)),
            },
          );
        } catch {
          res = undefined; // timeout / network: next attempt, then next model
          continue;
        }
        if ([404, 500, 502, 503, 504].includes(res.status)) {
          if (res.status === 404) break; // model unavailable for this key: next model
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        break outer; // success or a non-retryable error
      }
      res = undefined;
    }
    if (!res) throw new Error("Gemini is busy or slow right now. Please try again in a minute.");

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) {
        throw new Error("Gemini free-tier limit reached — wait a minute and try again.");
      }
      if (res.status === 503) {
        throw new Error("Gemini is busy right now (Google-side overload). Please try again in a minute.");
      }
      throw new Error(`Gemini error ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      candidates?: { content?: Content }[];
    };
    const content = data.candidates?.[0]?.content;
    const parts = content?.parts ?? [];

    finalText = parts
      .map((p) => p.text ?? "")
      .filter(Boolean)
      .join("\n\n");

    const calls = parts.filter((p) => p.functionCall);
    if (calls.length === 0 || !content) break;

    contents.push(content);
    const responses: Part[] = [];
    for (const c of calls) {
      const fc = c.functionCall!;
      const result = await executeTool(fc.name, fc.args ?? {}, opts.userId);
      actionsTaken.push({ tool: fc.name, result });
      responses.push({
        functionResponse: {
          name: fc.name,
          response: { result: JSON.parse(JSON.stringify(result ?? null)) },
        },
      });
    }
    contents.push({ role: "user", parts: responses });
  }

  return { finalText, actionsTaken };
}
