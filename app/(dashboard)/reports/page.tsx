import type { Metadata } from "next";
import ReportsClientView from "./reports-view";

export const metadata: Metadata = {
  title: "Reports",
  description: "Review and act on user-submitted platform reports.",
};

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return <ReportsClientView />;
}
