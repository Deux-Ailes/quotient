"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CaretDown as ChevronDown, Info } from "@phosphor-icons/react/dist/ssr";

/* ---------- Champs ---------- */

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function NumberField({ label, value, onChange, suffix = "€", hint, min = 0, max, step = 1, placeholder = "0" }: NumberFieldProps) {
  const id = useId();
  // Texte saisi, gardé tel quel : un « 0 » tapé reste affiché au lieu d'être remplacé par le champ vide.
  const [texte, setTexte] = useState(value === 0 ? "" : String(value));
  const saisie = parseFloat(texte);
  // Valeur changée de l'extérieur (exemple chargé, réinitialisation) : on resynchronise l'affichage.
  if ((Number.isFinite(saisie) ? saisie : 0) !== value) setTexte(value === 0 ? "" : String(value));
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="group relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            const n = parseFloat(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className="tabular h-11 w-full rounded-xl border border-line bg-surface px-3.5 pr-12 text-[15px] text-ink transition outline-none placeholder:text-ink-muted/70 hover:border-brand-100 focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-ink-muted">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs leading-relaxed text-ink-muted">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] outline-none transition hover:border-brand-100 focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-11 w-full appearance-none rounded-xl border border-line bg-surface px-3.5 pr-10 text-[15px] outline-none transition hover:border-brand-100 focus:border-brand focus:ring-4 focus:ring-brand/10"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted" />
      </div>
      {hint && <p className="text-xs leading-relaxed text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-ink">{label}</p>}
      <div role="radiogroup" className="inline-flex w-full flex-wrap gap-1 rounded-2xl bg-canvas p-1 ring-1 ring-line sm:w-auto">
        {options.map((o) => {
          const actif = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => onChange(o.value)}
              className={`flex-1 rounded-xl font-medium whitespace-nowrap transition sm:flex-none ${
                size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm"
              } ${actif ? "bg-surface text-ink shadow-card ring-1 ring-line" : "text-ink-soft hover:text-ink"}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl py-1">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-10 rounded-full bg-line transition peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow transition peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}

/* ---------- Mise en page ---------- */

export function Card({
  title,
  icon,
  description,
  children,
  action,
}: {
  title: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand">{icon}</span>}
          <div>
            <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
            {description && <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Collapsible({ title, subtitle, children, defaultOpen = false, badge }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; defaultOpen?: boolean; badge?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-line bg-canvas/40">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left" aria-expanded={open}>
        <span>
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            {title}
            {badge}
          </span>
          {subtitle && <span className="mt-0.5 block text-xs text-ink-muted">{subtitle}</span>}
        </span>
        <ChevronDown className={`size-4 shrink-0 text-ink-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-line px-4 py-4">{children}</div>}
    </div>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid gap-4 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{children}</div>;
}

export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" | "success" }) {
  const styles = {
    info: "bg-brand-50 text-ink-soft",
    warn: "bg-amber-50 text-ink-soft",
    success: "bg-mint-50 text-ink-soft",
  }[tone];
  const iconColor = { info: "text-brand", warn: "text-amber", success: "text-mint" }[tone];
  return (
    <div className={`flex gap-2.5 rounded-xl px-3.5 py-3 text-xs leading-relaxed ${styles}`}>
      <Info className={`mt-px size-4 shrink-0 ${iconColor}`} />
      <div>{children}</div>
    </div>
  );
}

export function Pill({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "mint" | "amber" | "muted" }) {
  const s = {
    brand: "bg-brand-50 text-brand",
    mint: "bg-mint-50 text-mint",
    amber: "bg-amber-50 text-amber",
    muted: "bg-canvas text-ink-soft ring-1 ring-line",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${s}`}>{children}</span>;
}

/* ---------- Nombre animé ---------- */

export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [affiche, setAffiche] = useState(value);
  const courant = useRef(value);

  useEffect(() => {
    const depart = courant.current;
    const delta = value - depart;
    if (delta === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      courant.current = value;
      setAffiche(value);
      return;
    }
    const duree = 450;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duree);
      const ease = 1 - Math.pow(1 - k, 3);
      courant.current = depart + delta * ease;
      setAffiche(courant.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format(affiche)}</>;
}
