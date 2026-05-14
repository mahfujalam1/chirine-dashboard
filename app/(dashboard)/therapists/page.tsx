"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/DataTable"
import { Input } from "@/components/ui/input"
import UserDetails from "@/components/ui/user-details"
import { getStatusColor } from "@/lib/utils"
import { ListTodo, Search, ShieldBan, ShieldCheck, Users } from "lucide-react"
import { Suspense, useState } from "react"
import Loading from "./loading"

const therapists = [
  { id: 1, name: "Sarah Johnson", email: "sarah.johnson@email.com", totalPost: 24, spent: "$4,250.00", status: "Active", joined: "Jan 2024" },
  { id: 2, name: "Michael Chen", email: "m.chen@email.com", totalPost: 18, spent: "$3,120.50", status: "Active", joined: "Feb 2024" },
  { id: 3, name: "Emma Wilson", email: "emma.w@email.com", totalPost: 32, spent: "$6,840.00", status: "Block", joined: "Nov 2023" },
  { id: 4, name: "James Brown", email: "james.brown@email.com", totalPost: 8, spent: "$890.25", status: "Active", joined: "Mar 2024" },
  { id: 5, name: "Lisa Anderson", email: "lisa.a@email.com", totalPost: 45, spent: "$9,312.80", status: "Block", joined: "Aug 2023" },
  { id: 6, name: "David Martinez", email: "d.martinez@email.com", totalPost: 12, spent: "$1,560.00", status: "Active", joined: "Dec 2023" },
  { id: 7, name: "Jennifer Lee", email: "j.lee@email.com", totalPost: 3, spent: "$245.00", status: "New", joined: "Apr 2024" },
  { id: 8, name: "Robert Taylor", email: "r.taylor@email.com", totalPost: 0, spent: "$0.00", status: "Inactive", joined: "Jan 2024" },
]

export default function TherapistsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredTherapists = therapists.filter(
    (therapist) =>
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Suspense fallback={<Loading />}>
      <>
        <PageHeader
          title="Therapists"
          description="Manage and view your therapist base."
        >
        </PageHeader>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Therapists</span>
                <div className="p-2 bg-muted rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">4,263</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pending Therapists</span>
                <div className="p-2 bg-muted rounded-lg">
                  <ListTodo className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">34</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Therapists</span>
                <div className="p-2 bg-muted rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">847</p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Blocked Therapists</span>
                <div className="p-2 bg-muted rounded-lg">
                  <ShieldBan className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">68</p>
            </CardContent>
          </Card>

        </div>

        {/* Customer Segments & List */}
        <div className="grid grid-cols-1 gap-4">
          {/* Customer List */}
          <Card className="lg:col-span-3 bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">All Therapists</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search therapists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(null)}
                  className={statusFilter === null ? "bg-foreground text-background" : "bg-transparent"}
                >
                  All Therapists
                </Button>
                {["Pending Therapists", "Active", "Blocked"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-foreground text-background" : "bg-transparent"}
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <DataTable
                data={filteredTherapists}
                columns={[
                  { key: "name", title: "Therapist", renderItem: (value) => <UserDetails name={value?.name || ""} email={value?.email || ""} /> },
                  { key: "status", title: "Status", renderItem: (value) => <Badge className={getStatusColor(value?.status as string)}>{value?.status}</Badge> },
                  { key: "totalPost", title: "Total Post" },
                  { key: "joined", title: "Joined" },
                  { key: "id", title: "Actions", renderItem: () => <Button variant="outline" size="sm">View</Button> },
                ]}
                meta={{
                  limit: 10,
                  total: filteredTherapists.length,
                  page: 1,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </>
    </Suspense>
  )
}
