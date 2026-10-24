const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eurCents = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("fr-FR", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const formatEur = (n: number) => eur.format(Math.round(n));
export const formatEurCents = (n: number) => eurCents.format(n);
export const formatNombre = (n: number) => nombre.format(n);
export const formatPct = (n: number) => pct.format(n);
