import type { Metadata } from "next";
import ProfileClientView from "./profile-view";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and update administrator profile information and account security settings.",
};

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <ProfileClientView />;
}
