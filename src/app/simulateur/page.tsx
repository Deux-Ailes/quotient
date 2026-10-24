import type { Metadata } from "next";
import { Simulateur } from "@/components/sim/Simulateur";

export const metadata: Metadata = {
  title: "Simulateur | Quotient",
  description: "Simulez votre impôt sur le revenu : foyer, revenus, frais réels, réductions et crédits d'impôt.",
};

export default function PageSimulateur() {
  return <Simulateur />;
}
