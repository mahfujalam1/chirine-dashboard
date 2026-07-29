import type { Metadata } from "next";
import TherapistDetailsClientView from "./therapist-details-view";

export const metadata: Metadata = {
  title: "Therapist Details",
  description: "View detailed credentials, licensing, and personal information for a therapist.",
};

export const dynamic = "force-dynamic";

export default function TherapistDetailsPage() {
  return <TherapistDetailsClientView />;
}