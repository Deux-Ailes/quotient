import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink ${className}`}>
      <span className="bg-brand-gradient grid size-8 place-items-center rounded-xl text-white shadow-lift">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M15.5 15.5 20 20" />
        </svg>
      </span>
      Quotient
    </Link>
  );
}
