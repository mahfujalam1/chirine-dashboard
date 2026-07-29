import type { Metadata } from "next";
import EventRequestsClientView from "./events-requests-view";

export const metadata: Metadata = {
  title: "Event Requests",
  description: "Review event requests submitted by users and approve or reject them.",
};

export const dynamic = "force-dynamic";

export default function EventRequestsPage() {
  return <EventRequestsClientView />;
}
