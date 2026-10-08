import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { TOOLS, executeTool } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { todayISO } from "@/lib/utils";
import { runGemini } from "@/lib/ai/gemini";

export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const MAX_TOOL_ROUNDS = 8;

type ChatTurn = { role: "user" | "assistant"; content: string };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, user.id))
    .orderBy(asc(chatMessages.createdAt))
    .limit(100);

  return NextResponse.json({
    messages: rows.map((r) => ({ role: r.role, content: r.content })) as ChatTurn[],
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Provider: AI_PROVIDER=gemini|anthropic, else whichever key is set (Gemini wins if both).
  const provider =
    process.env.AI_PROVIDER ||
    (process.env.GEMINI_API_KEY ? "gemini" : process.env.ANTHROPIC_API_KEY ? "anthropic" : "none");

  if (provider === "none" || (provider === "gemini" && !process.env.GEMINI_API_KEY) || (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY)) {
    return NextResponse.json(
      { error: "No AI key set. Add GEMINI_API_KEY (free) or ANTHROPIC_API_KEY to your environment variables — see README.md." },
      { status: 500 },
    );
  }

  const { message } = (await req.json()) as { message: string };
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  // Load recent history for context, then persist the new user turn.
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, user.id))
    .orderBy(asc(chatMessages.createdAt))
    .limit(40);

  await db.insert(chatMessages).values({ userId: user.id, role: "user", content: message });

  if (provider === "gemini") {
    try {
      const { finalText, actionsTaken } = await runGemini({
        system: buildSystemPrompt(user.email ?? "the owner", todayISO()),
        history: history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
        message,
        userId: user.id,
      });
      const reply = finalText || "I ran into an issue completing that — could you try rephrasing?";
      await db.insert(chatMessages).values({ userId: user.id, role: "assistant", content: reply });
      return NextResponse.json({ reply, actions: actionsTaken });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Gemini request failed" }, { status: 502 });
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const conversation: Anthropic.MessageParam[] = [
    ...history.map((h): Anthropic.MessageParam => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user", content: message },
  ];

  const system = buildSystemPrompt(user.email ?? "the owner", todayISO());
  const actionsTaken: { tool: string; result: unknown }[] = [];

  let finalText = "";
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1536,
      system,
      tools: TOOLS,
      messages: conversation,
    });

    const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
    finalText = textBlocks.map((b) => b.text).join("\n\n");

    const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    if (toolUses.length === 0 || response.stop_reason !== "tool_use") {
      break;
    }

    conversation.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const result = await executeTool(use.name, (use.input as Record<string, unknown>) ?? {}, user.id);
      actionsTaken.push({ tool: use.name, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: JSON.stringify(result),
      });
    }
    conversation.push({ role: "user", content: toolResults });
  }

  if (!finalText) {
    finalText = "I ran into an issue completing that — could you try rephrasing?";
  }

  await db.insert(chatMessages).values({ userId: user.id, role: "assistant", content: finalText });

  return NextResponse.json({ reply: finalText, actions: actionsTaken });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await db.delete(chatMessages).where(eq(chatMessages.userId, user.id));
  return NextResponse.json({ cleared: true });
}
