import type { Metadata } from "next";
import SupportClientView from "./support-view";

export const metadata: Metadata = {
  title: "Customer Support",
  description: "View, manage, and respond to customer support tickets.",
};

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return <SupportClientView />;
}
