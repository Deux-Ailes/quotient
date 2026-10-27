"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { CLE_THEME } from "@/lib/theme";

function choixMemorise(): "light" | "dark" | null {
  try {
    const t = localStorage.getItem(CLE_THEME);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/** Bascule clair / sombre. Sans choix mémorisé, suit le thème du système, y compris s'il change. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [sombre, setSombre] = useState<boolean | null>(null);

  useEffect(() => {
    setSombre(document.documentElement.dataset.theme === "dark");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const suivreSysteme = () => {
      if (choixMemorise()) return;
      document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
      setSombre(mq.matches);
    };
    mq.addEventListener("change", suivreSysteme);
    return () => mq.removeEventListener("change", suivreSysteme);
  }, []);

  const basculer = () => {
    const suivant = !sombre;
    const theme = suivant ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(CLE_THEME, theme);
    } catch {
      /* stockage indisponible : le choix vaut pour cette page seulement */
    }
    setSombre(suivant);
  };

  const libelle = sombre ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={libelle}
      title={libelle}
      className={`grid size-9 shrink-0 place-items-center rounded-full bg-surface text-ink-soft ring-1 ring-line transition hover:text-brand hover:ring-brand-100 active:scale-95 ${className}`}
    >
      {sombre === null ? <span className="size-[18px]" /> : sombre ? <Sun aria-hidden className="size-[18px]" weight="bold" /> : <Moon aria-hidden className="size-[18px]" weight="bold" />}
    </button>
  );
}
