import type { Metadata } from "next";
import ProfessionsClientView from "./professions-view";

export const metadata: Metadata = {
  title: "Professions",
  description: "Manage professions used to organize governing bodies.",
};

export const dynamic = "force-dynamic";

export default function ProfessionsPage() {
  return <ProfessionsClientView />;
}
