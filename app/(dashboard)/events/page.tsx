import type { Metadata } from "next";
import EventsClientView from "./events-view";

export const metadata: Metadata = {
  title: "Events",
  description: "Create and manage published events by category.",
};

export const dynamic = "force-dynamic";

export default function EventsPage() {
  return <EventsClientView />;
}
