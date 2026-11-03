import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  image,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Optional photo URL — renders a full-width hero banner. */
  image?: string;
  /** Small label above the title (hero only). */
  eyebrow?: string;
}) {
  if (image) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-indigo-950 via-neutral-900 to-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-transparent to-transparent" />
        <div className="relative flex min-h-[11rem] flex-wrap items-end justify-between gap-4 px-5 pb-5 pt-16 sm:min-h-[13rem] sm:px-7 sm:pb-6">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-neutral-200 sm:text-base">{subtitle}</p>}
          </div>
          {action && <div className="rounded-xl bg-neutral-950/50 px-3 py-2 backdrop-blur">{action}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-900/50",
        // cn() doesn't merge Tailwind classes, so let callers opt out of the default padding with "p-0".
        !className?.split(/\s+/).includes("p-0") && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition",
        variant === "primary"
          ? "bg-indigo-600 text-white hover:bg-indigo-500"
          : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50",
        variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500",
        variant === "ghost" && "border border-neutral-700 text-neutral-300 hover:bg-neutral-800",
        variant === "danger" && "border border-red-900 text-red-400 hover:bg-red-950/40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-neutral-800", className)}>
      <div
        className="h-full rounded-full bg-indigo-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 px-6 py-14 text-center">
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500",
        props.className,
      )}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-sm text-neutral-300">{children}</label>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
