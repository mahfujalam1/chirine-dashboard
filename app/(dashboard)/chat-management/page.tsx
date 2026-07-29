import type { Metadata } from "next";
import ChatManagementClientView from "./chat-management-view";

export const metadata: Metadata = {
  title: "Chat Management",
  description: "Monitor active chat channels, therapists, and room status.",
};

export const dynamic = "force-dynamic";

export default function ChatManagementPage() {
  return <ChatManagementClientView />;
}
