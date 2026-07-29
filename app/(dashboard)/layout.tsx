import type { ReactNode } from "react"
import { Header } from "@/components/dashboard/header"
import { AuthGuard } from "@/components/auth/auth-guard"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | MindShift Admin",
  },
  description: "MindShift Peer Connect administrative management and analytics portal.",
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <Header />
        {children}
      </div>
    </div>
  </AuthGuard>
}
