"use client"
import { MetricCard } from "@/components/dashboard/metric-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfitChart } from "@/components/dashboard/profit-chart"
import { UsersMatrix } from "@/components/dashboard/users-matrix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/DataTable"
import UserDetails from "@/components/ui/user-details"
import { Brain, Calendar, CalendarDays, DollarSign, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const therapists = [
    { id: 1, name: "Sarah Johnson", email: "sarah.johnson@email.com", totalPost: 24, spent: "$4,250.00", status: "Active", joined: "Jan 2024" },
    { id: 2, name: "Michael Chen", email: "m.chen@email.com", totalPost: 18, spent: "$3,120.50", status: "Active", joined: "Feb 2024" },
    { id: 3, name: "Emma Wilson", email: "emma.w@email.com", totalPost: 32, spent: "$6,840.00", status: "Block", joined: "Nov 2023" },
    { id: 4, name: "James Brown", email: "james.brown@email.com", totalPost: 8, spent: "$890.25", status: "Active", joined: "Mar 2024" },
    { id: 5, name: "Lisa Anderson", email: "lisa.a@email.com", totalPost: 45, spent: "$9,312.80", status: "Block", joined: "Aug 2023" },
  ]

  return (
    <>
      <PageHeader
        title="Welcome, Chirine 👋"
        description="Analytics dashboard for your app."
      >
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          This Week
        </Button>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Therapist" value="68,837" isPositiveOutcome={true} icon={Brain} />
        <MetricCard title="Total Earning" value="12,485" isPositiveOutcome={true} icon={DollarSign} />
        <MetricCard title="Total Event" value="4,263" isPositiveOutcome={true} icon={CalendarDays} />
        <MetricCard title="Total Consultation" value="1.5%" isPositiveOutcome={true} icon={Users} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        <div className="h-full">
          <UsersMatrix />
        </div>
      </div>
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Recent Therapists</CardTitle>
              <CardDescription>Latest therapists added to the platform</CardDescription>
            </div>
            <Link href="/therapists">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={therapists} columns={[
            { key: "name", title: "Therapist", renderItem: (value) => <UserDetails name={value?.name || ""} email={value?.email || ""} /> },
            { key: "status", title: "Status", renderItem: (value) => <Badge>{value?.status}</Badge> },
            { key: "totalPost", title: "Total Post" },
            { key: "joined", title: "Joined" },
            { key: "id", title: "Actions", renderItem: () => <Button variant="outline" size="sm">View</Button> },
          ]} />
        </CardContent>
      </Card>
    </>
  )
}
