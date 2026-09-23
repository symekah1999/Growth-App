import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
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
    <div className={cn("rounded-xl border border-neutral-800 bg-neutral-900/50 p-5", className)}>
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
