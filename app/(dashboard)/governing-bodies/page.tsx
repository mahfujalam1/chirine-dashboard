import type { Metadata } from "next";
import GoverningBodiesClientView from "./governing-bodies-view";

export const metadata: Metadata = {
  title: "Governing Bodies",
  description: "Manage professional governing bodies and their professions.",
};

export const dynamic = "force-dynamic";

export default function GoverningBodiesPage() {
  return <GoverningBodiesClientView />;
}
