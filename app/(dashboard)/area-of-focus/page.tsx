import type { Metadata } from "next";
import AreaOfFocusClientView from "./area-of-focus-view";

export const metadata: Metadata = {
  title: "Area Of Focus",
  description: "Manage area of focus items.",
};

export const dynamic = "force-dynamic";

export default function AreaOfFocusPage() {
  return <AreaOfFocusClientView />;
}
