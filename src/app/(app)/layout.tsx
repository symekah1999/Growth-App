import { requireUser } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { signOut } from "@/app/logout/actions";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LogOut, Sprout } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-800/80 bg-neutral-900/60">
        <div className="border-b border-neutral-800/80 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-950/40">
              <Sprout size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-neutral-50">Growth OS</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
        </div>
        <Nav />
        <form action={signOut} className="border-t border-neutral-800/80 p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800/60 hover:text-neutral-100"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto bg-[radial-gradient(ellipse_120%_60%_at_50%_-10%,rgba(99,102,241,0.08),transparent)]">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">{children}</div>
      </main>
      <ChatWidget />
    </div>
  );
}
