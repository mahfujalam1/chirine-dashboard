"use client";

import {
  Report,
  ReportStatus,
  useDeleteReportMutation,
  useGetAllReportsQuery,
  useUpdateStatusMutation,
} from "@/lib/redux/services/reportApis";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReportDetailsDialog } from "@/components/dashboard/reports/report-details-dialog";
import { ReportUserCell } from "@/components/dashboard/reports/report-user-cell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ColumnDef, DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import {
  Bug,
  CheckCircle,
  ClockArrowDown,
  ClockArrowUp,
  Eye,
  RefreshCw,
  Search,
  SquareX,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_STYLES: Record<ReportStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function ReportsClientView() {
  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<Report | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const limit = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAllReportsQuery({
      page,
      limit,
      ...(status && { status }),
      ...(debouncedSearch && { search: debouncedSearch }),
    });
  const [updateStatus, statusState] = useUpdateStatusMutation();
  const [deleteReport, deleteState] = useDeleteReportMutation();
  const busy = statusState.isLoading || deleteState.isLoading;

  async function handleStatus(
    report: Report,
    nextStatus: "Resolved" | "Rejected",
  ) {
    setDetails(null);
    try {
      const response = await updateStatus({
        id: report._id,
        status: nextStatus,
      }).unwrap();
      toast.success(response.message || `Report ${nextStatus.toLowerCase()}`);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Unable to update report",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setDetails(null);
    try {
      const response = await deleteReport({ id: target._id }).unwrap();
      toast.success(response.message || "Report deleted");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Unable to delete report",
      );
    }
  }

  const columns: ColumnDef<Report>[] = [
    {
      title: "Reported By",
      renderItem: (report) => <ReportUserCell user={report.reporter} />,
    },
    {
      title: "Type",
      renderItem: (report) => (
        <Badge variant="outline">{report.reportType}</Badge>
      ),
    },
    {
      title: "Reported User",
      renderItem: (report) => <ReportUserCell user={report.reportedUser} />,
    },
    {
      title: "Report",
      renderItem: (report) => (
        <div className="max-w-72">
          <p className="font-medium">{report.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {report.description}
          </p>
        </div>
      ),
    },
    {
      title: "Date",
      renderItem: (report) => (
        <span className="text-muted-foreground">
          {formatDate(report.createdAt)}
        </span>
      ),
    },
    {
      title: "Status",
      renderItem: (report) => (
        <Badge variant="outline" className={STATUS_STYLES[report.status]}>
          {report.status}
        </Badge>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (report) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            title="View details"
            onClick={(event) => {
              event.stopPropagation();
              setDetails(report);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {report.status === "Pending" && (
            <>
              <Button
                size="icon"
                variant="ghost"
                title="Resolve"
                className="text-emerald-600"
                disabled={busy}
                onClick={(event) => {
                  event.stopPropagation();
                  handleStatus(report, "Resolved");
                }}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Reject"
                className="text-destructive"
                disabled={busy}
                onClick={(event) => {
                  event.stopPropagation();
                  handleStatus(report, "Rejected");
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            title="Delete"
            className="text-destructive"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              setDeleteTarget(report);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = data?.data.stats;
  const metrics = [
    {
      label: "Total Reports",
      value: stats?.totalReports ?? 0,
      icon: Bug,
      filter: null,
    },
    {
      label: "Pending",
      value: stats?.pendingReports ?? 0,
      icon: ClockArrowDown,
      filter: "Pending" as ReportStatus,
    },
    {
      label: "Resolved",
      value: stats?.resolvedReports ?? 0,
      icon: ClockArrowUp,
      filter: "Resolved" as ReportStatus,
    },
    {
      label: "Rejected",
      value: stats?.rejectedReports ?? 0,
      icon: SquareX,
      filter: "Rejected" as ReportStatus,
    },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Review and act on user-submitted reports."
      />
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            className={`rounded text-left transition-all ${status === metric.filter ? "bg-gray-300 dark:bg-slate-800" : ""}`}
            onClick={() => {
              setStatus(metric.filter);
              setPage(1);
            }}
          >
            <MetricCard
              title={metric.label}
              value={String(metric.value)}
              isPositiveOutcome
              icon={metric.icon}
            />
          </button>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">User Reports</CardTitle>
              <CardDescription>
                {data?.data.meta.total ?? 0} reports match the current filters
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex gap-2 overflow-x-auto">
                {[null, "Pending", "Resolved", "Rejected"].map((item) => (
                  <Button
                    key={item ?? "All"}
                    size="sm"
                    variant={status === item ? "default" : "outline"}
                    className={
                      status === item ? "bg-foreground text-background" : ""
                    }
                    onClick={() => {
                      setStatus(item as ReportStatus | null);
                      setPage(1);
                    }}
                  >
                    {item ?? "All"}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-9 sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center rounded border border-destructive/30 bg-destructive/5 p-10 text-center">
              <p className="font-medium text-destructive">
                Unable to load reports
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your connection and try again.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              data={data?.data.result ?? []}
              columns={columns}
              rowKey={(report) => report._id}
              onRowClick={setDetails}
              loading={isLoading || isFetching}
              emptyText="No reports match the current filters."
              meta={{
                total: data?.data.meta.total ?? 0,
                page: data?.data.meta.page ?? page,
                limit: data?.data.meta.limit ?? limit,
              }}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
      <ReportDetailsDialog
        report={details}
        busy={busy}
        onClose={() => setDetails(null)}
        onStatus={handleStatus}
        onDelete={(report) => {
          setDetails(null);
          setDeleteTarget(report);
        }}
      />
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be permanently deleted. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteState.isLoading}
              onClick={handleDelete}
            >
              {deleteState.isLoading ? "Deleting..." : "Delete report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
