"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/DataTable"
import { Input } from "@/components/ui/input"
import UserDetails from "@/components/ui/user-details"
import { useDebounce } from '@/hooks/use-debounce'
import { useGetAllTherapistsQuery } from '@/lib/redux/services/userApis'
import { getStatusColor } from '@/lib/utils'
import { User } from '@/types/userApis'
import { Eye, ListTodo, Search, ShieldBan, ShieldCheck, Users } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from "react"

import { MetricCard } from "@/components/dashboard/metric-card"

type FilterType = 'All' | 'Pending' | 'Active' | 'Blocked'

export default function TherapistsClientView() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const router = useRouter()

  useEffect(() => {
    setPage(1)
  }, [activeFilter, debouncedSearchQuery])

  const getApiStatus = (filter: FilterType): string => {
    switch (filter) {
      case 'Pending':
        return 'Pending';
      case 'Active':
        return 'Active';
      case 'Blocked':
        return 'Blocked';
      case 'All':
      default:
        return 'All';
    }
  }

  const { data, isLoading, error, isFetching } = useGetAllTherapistsQuery({
    status: getApiStatus(activeFilter),
    searchTerm: debouncedSearchQuery,
    page,
  })

  const userData: User[] = useMemo(() => data?.data?.result ?? [], [data])

  if (error) return <div className="text-red-500 p-6">Failed to load therapists.</div>;

  const filterButtons: { label: string; value: FilterType; icon: React.ReactNode }[] = [
    { label: 'All User', value: 'All', icon: <Users className="w-4 h-4" /> },
    { label: 'Pending', value: 'Pending', icon: <ListTodo className="w-4 h-4" /> },
    { label: 'Active', value: 'Active', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Blocked', value: 'Blocked', icon: <ShieldBan className="w-4 h-4" /> },
  ]

  return (
    <>
      <PageHeader
        title="User"
        description="Manage and view your therapist base."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total User"
          value={data?.data?.stats?.totalTherapists ?? data?.data?.meta?.total ?? 0}
          icon={Users}
        />
        <MetricCard
          title="Pending"
          value={data?.data?.stats?.pendingTherapists ?? 0}
          icon={ListTodo}
        />
        <MetricCard
          title="Active"
          value={data?.data?.stats?.activeTherapists ?? 0}
          icon={ShieldCheck}
        />
        <MetricCard
          title="Blocked"
          value={data?.data?.stats?.blockedTherapists ?? 0}
          icon={ShieldBan}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="lg:col-span-3 bg-card border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">All User</CardTitle>
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
              {filterButtons.map((button) => (
                <Button
                  key={button.value}
                  variant={activeFilter === button.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(button.value)}
                  className={
                    activeFilter === button.value
                      ? "bg-foreground text-background"
                      : "bg-transparent"
                  }
                >
                  <span className="mr-2">{button.icon}</span>
                  {button.label}
                </Button>
              ))}
            </div>

            <DataTable
              data={userData}
              loading={isFetching || isLoading}
              columns={[
                {
                  key: "fullName",
                  title: "Therapist",
                  renderItem: (value) => (
                    <UserDetails
                      name={value?.fullName || ""}
                      email={value?.email || ""}
                    />
                  )
                },
                { key: "email", title: "Email" },
                {
                  key: "isVerified",
                  title: "Verification Status",
                  renderItem: (value) => (
                    <Badge className={getStatusColor(value?.isVerified ? "ACTIVE" : "INACTIVE")}>
                      {value?.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  )
                },
                {
                  key: "isBlocked",
                  title: "Account Status",
                  renderItem: (value) => (
                    <Badge className={getStatusColor(value?.isBlocked ? "BLOCKED" : "ACTIVE")}>
                      {value?.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  )
                },
                {
                  key: "createdAt",
                  title: "Joined",
                  renderItem: (value) => (
                    <span className='text-nowrap'>
                      {new Date(value?.createdAt).toLocaleDateString()}
                    </span>
                  )
                },
                {
                  key: "_id",
                  title: "Actions",
                  renderItem: (value) => (
                    <Button onClick={() => router.push(`/therapists/${value?._id}`)} variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> View</Button>
                  )
                },
              ]}
              meta={{
                limit: data?.data?.meta?.limit || 10,
                total: data?.data?.meta?.total || 0,
                page: data?.data?.meta?.page || page,
              }}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
