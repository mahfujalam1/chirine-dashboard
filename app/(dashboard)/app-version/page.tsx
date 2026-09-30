import type { Metadata } from "next";
import AppVersionClientView from "./app-version-view";

export const metadata: Metadata = {
  title: "App Version",
  description: "Manage Android and iOS mobile app update prompts.",
};

export default function AppVersionPage() {
  return <AppVersionClientView />;
}
