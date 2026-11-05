import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { CaptureForm } from "@/components/CaptureForm";
import { photoUrl } from "@/lib/images";

export default async function CapturePage() {
  await requireUser();
  return (
    <div>
      <PageHeader image={photoUrl("journal")} title="Quick capture" subtitle="Jot something down in seconds. Works offline: notes are kept on this device and synced later." />
      <Card>
        <CaptureForm />
      </Card>
      <p className="mt-3 text-xs text-neutral-500">
        Tip: open this page once while online so it is available offline. Saved notes appear in your Journal, Gratitude and To-dos.
      </p>
    </div>
  );
}
