import { requireUser } from "@/lib/auth";
import { collectExport } from "@/lib/export";
import { Card, PageHeader } from "@/components/ui";
import { photoUrl } from "@/lib/images";
import { Download, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const user = await requireUser();
  const sections = await collectExport(user.id);
  const total = sections.reduce((s, x) => s + x.rows.length, 0);

  return (
    <div>
      <PageHeader image={photoUrl("progress")} title="Backup & export" subtitle="Download everything you have written and tracked. Your data is yours." />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-100">
              <ShieldCheck size={15} className="text-emerald-400" /> Full backup
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              {total.toLocaleString()} records across {sections.filter((s) => s.rows.length).length} sections, in one JSON file.
            </p>
          </div>
          <a
            href="/api/export?format=json"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Download size={15} /> Download backup (.json)
          </a>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          This is a download only. There is no one-click restore yet, so keep the file somewhere safe. It includes private entries such as your journal and recovery data, so don&apos;t share it.
        </p>
      </Card>

      <Card className="p-0">
        <ul className="divide-y divide-neutral-800">
          {sections.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="text-neutral-100">{s.label}</p>
                <p className="text-xs text-neutral-500">
                  {s.missing ? "Not set up yet" : `${s.rows.length.toLocaleString()} record${s.rows.length === 1 ? "" : "s"}`}
                </p>
              </div>
              {s.rows.length > 0 ? (
                <a
                  href={`/api/export?format=csv&section=${s.key}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  <Download size={12} /> CSV
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
