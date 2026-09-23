import { PageHeader } from "@/components/ui";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <PageHeader title="Assistant" subtitle="Talk through anything — it can see and update your whole OS." />
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
        <ChatPanel />
      </div>
    </div>
  );
}
