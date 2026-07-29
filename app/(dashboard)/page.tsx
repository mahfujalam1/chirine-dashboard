import type { Metadata } from "next";
import DashboardClientView from "./dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description:
    "MindShift Peer Connect platform analytics overview, earnings, and therapist management.",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClientView />;
}
