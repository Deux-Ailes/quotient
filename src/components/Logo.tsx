import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink ${className}`}>
      <span className="bg-brand-gradient grid size-8 place-items-center rounded-xl text-white shadow-lift">
        <MagnifyingGlass aria-hidden className="size-4.5" weight="bold" />
      </span>
      Quotient
    </Link>
  );
}
