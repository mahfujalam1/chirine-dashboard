"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetails from "@/components/ui/user-details";
import { useGetDashboardStatsQuery } from "@/lib/redux/services/dashboardApis";
import { useGetAllTherapistsQuery } from "@/lib/redux/services/userApis";
import { getStatusColor } from "@/lib/utils";
import {
  AlertCircle,
  Brain,
  Calendar,
  CalendarDays,
  DollarSign,
  RefreshCw,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";

const ProfitChart = dynamic(
  () =>
    import("@/components/dashboard/profit-chart").then((m) => m.ProfitChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-70 w-full rounded-xl" />,
  },
);

const UsersMatrix = dynamic(
  () =>
    import("@/components/dashboard/users-matrix").then((m) => m.UsersMatrix),
  {
    ssr: false,
    loading: () => <Skeleton className="h-70 w-full rounded-xl" />,
  },
);

export default function DashboardClientView() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDashboardStatsQuery({ year: selectedYear });

  const {
    data: therapistsData,
    isLoading: isTherapistsLoading,
    isFetching: isTherapistsFetching,
    isError: isTherapistsError,
    refetch: refetchTherapists,
  } = useGetAllTherapistsQuery({
    limit: 5,
    status: "All",
  });

  const formatCurrency = (val: number | undefined) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val ?? 0);
  };

  const therapists = therapistsData?.data?.result ?? [];

  const therapistColumns = useMemo(
    () => [
      {
        key: "fullName",
        title: "Therapist",
        renderItem: (value: any) => (
          <UserDetails
            name={value?.fullName || ""}
            email={value?.email || ""}
          />
        ),
      },
      {
        key: "isBlocked",
        title: "Status",
        renderItem: (value: any) => (
          <Badge
            className={getStatusColor(value?.isBlocked ? "BLOCKED" : "ACTIVE")}
          >
            {value?.isBlocked ? "Blocked" : "Active"}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        title: "Joined",
        renderItem: (value: any) => (
          <span className="text-nowrap">
            {value?.createdAt
              ? new Date(value.createdAt).toLocaleDateString()
              : ""}
          </span>
        ),
      },
      {
        key: "_id",
        title: "Actions",
        renderItem: (value: any) => (
          <Link href={`/therapists/${value?._id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  if (isError || isTherapistsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125 p-6 text-center">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full mb-4 animate-bounce">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          We encountered an error while fetching your dashboard analytics or
          recent therapists.
        </p>
        <Button
          onClick={() => {
            refetch();
            refetchTherapists();
          }}
          className="flex items-center gap-2 bg-[#00ACA7] hover:bg-[#009691] text-white transition-colors"
          disabled={isFetching || isTherapistsFetching}
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching || isTherapistsFetching ? "animate-spin" : ""}`}
          />
          {isFetching || isTherapistsFetching ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    );
  }

  if (isLoading || isTherapistsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 pb-6 border-b border-border mb-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card className="lg:col-span-2 bg-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-50 w-full" />
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-37.5 w-full mt-4" />
          </Card>
        </div>

        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-12 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isGrowthPositive =
    !data?.data?.totalConsultation?.growthPercentage?.startsWith("-");

  return (
    <>
      <PageHeader
        title="Welcome, Chirine 👋"
        description="Analytics dashboard for your app."
      >
        <div className="flex items-center gap-2">
          {(isFetching || isTherapistsFetching) && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse mr-2 bg-muted/50 px-2.5 py-1 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-[#00ACA7] animate-ping" />
              Syncing...
            </span>
          )}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-30 bg-transparent border-border text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Therapist"
          value={data?.data?.totalTherapist?.toLocaleString() || "0"}
          isPositiveOutcome={true}
          icon={Brain}
        />
        <MetricCard
          title="Total Earning"
          value={formatCurrency(data?.data?.totalEarning)}
          isPositiveOutcome={true}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Event"
          value={data?.data?.totalEvent?.toLocaleString() || "0"}
          isPositiveOutcome={true}
          icon={CalendarDays}
        />
        <MetricCard
          title="Total Consultation"
          value={data?.data?.totalConsultation?.count?.toLocaleString() || "0"}
          change={data?.data?.totalConsultation?.growthPercentage}
          isPositiveOutcome={isGrowthPositive}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProfitChart data={data?.data?.totalEarningOverview} />
        </div>
        <div className="h-full">
          <UsersMatrix
            data={data?.data?.usersGrowthMatrix}
            activeYear={selectedYear}
          />
        </div>
      </div>

      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">
                Recent User
              </CardTitle>
              <CardDescription>
                Latest therapists added to the platform
              </CardDescription>
            </div>
            <Link href="/therapists">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={therapists}
            loading={isFetching || isTherapistsFetching}
            columns={therapistColumns}
          />
        </CardContent>
      </Card>
    </>
  );
}
