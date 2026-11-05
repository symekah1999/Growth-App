import { getCurrentUser } from "@/lib/auth";
import { collectExport, toCsv } from "@/lib/export";

export const dynamic = "force-dynamic";

/** GET /api/export?format=json            -> everything, one JSON file
 *  GET /api/export?format=csv&section=key  -> one section as CSV */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const section = url.searchParams.get("section");
  const stamp = new Date().toISOString().slice(0, 10);
  const sections = await collectExport(user.id);
  const headers = { "Cache-Control": "no-store" };

  if (format === "csv") {
    const sec = sections.find((x) => x.key === section);
    if (!sec) return new Response("Unknown section", { status: 400 });
    return new Response(toCsv(sec.rows), {
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="growth-os-${sec.key}-${stamp}.csv"`,
      },
    });
  }

  const body = {
    app: "Growth OS",
    exportedAt: new Date().toISOString(),
    counts: Object.fromEntries(sections.map((x) => [x.key, x.rows.length])),
    data: Object.fromEntries(sections.map((x) => [x.key, x.rows])),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="growth-os-backup-${stamp}.json"`,
    },
  });
}
