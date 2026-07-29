import type { Metadata } from "next";
import ChatAssetsClientView from "./chat-assets-view";

export const metadata: Metadata = {
  title: "Chat Assets",
  description: "Manage images, GIFs, stickers, and multimedia assets for chat.",
};

export const dynamic = "force-dynamic";

export default function ChatAssetsPage() {
  return <ChatAssetsClientView />;
}