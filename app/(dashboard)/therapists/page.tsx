import type { Metadata } from "next";
import TherapistsClientView from "./therapists-view";

export const metadata: Metadata = {
  title: "Therapists",
  description: "Manage and view your therapist base, status, and verification details.",
};

export const dynamic = "force-dynamic";

export default function TherapistsPage() {
  return <TherapistsClientView />;
}