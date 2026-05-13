"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTable, ColumnDef } from "@/components/ui/DataTable"
import { MetricCard } from "@/components/dashboard/metric-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Bug,
  ClockArrowDown,
  ClockArrowUp,
  SquareX,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Tag,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { useState, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStatus = "pending" | "resolved" | "rejected"
type ReportType = "violations" | "spam" | "harassment" | "inappropriate_content" | "misinformation" | "other"

interface UserRef {
  name: string
  email: string
  avatar?: string
}

interface Report {
  id: string
  status: ReportStatus
  reportBy: UserRef
  reportType: ReportType
  reportOn: UserRef
  reason: string
  reportPostID: string
  createdAt: string
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_REPORTS: Report[] = [
  {
    id: "1",
    status: "pending",
    reportBy: { name: "John Doe", email: "john.doe@example.com" },
    reportType: "violations",
    reportOn: { name: "Jane Smith", email: "jane.smith@example.com" },
    reason: "This user repeatedly violated community guidelines by posting offensive content targeting specific groups.",
    reportPostID: "post-123",
    createdAt: "2025-10-15",
  },
  {
    id: "2",
    status: "pending",
    reportBy: { name: "Alice Chen", email: "alice.chen@example.com" },
    reportType: "spam",
    reportOn: { name: "Bob Miller", email: "bob.miller@example.com" },
    reason: "User is sending repetitive promotional messages to multiple users without consent.",
    reportPostID: "post-456",
    createdAt: "2025-10-18",
  },
  {
    id: "3",
    status: "resolved",
    reportBy: { name: "Marcus Lee", email: "marcus.lee@example.com" },
    reportType: "harassment",
    reportOn: { name: "Priya Patel", email: "priya.patel@example.com" },
    reason: "The reported user has been sending threatening and abusive direct messages.",
    reportPostID: "post-789",
    createdAt: "2025-10-10",
  },
  {
    id: "4",
    status: "rejected",
    reportBy: { name: "Sofia Torres", email: "sofia.torres@example.com" },
    reportType: "misinformation",
    reportOn: { name: "Liam Brooks", email: "liam.brooks@example.com" },
    reason: "Post contains factually incorrect medical information that could be harmful.",
    reportPostID: "post-321",
    createdAt: "2025-10-12",
  },
  {
    id: "5",
    status: "pending",
    reportBy: { name: "Noah Kim", email: "noah.kim@example.com" },
    reportType: "inappropriate_content",
    reportOn: { name: "Emma Davis", email: "emma.davis@example.com" },
    reason: "Profile picture and recent posts contain graphic content not suitable for the platform.",
    reportPostID: "post-654",
    createdAt: "2025-10-20",
  },
  {
    id: "6",
    status: "resolved",
    reportBy: { name: "Olivia Wright", email: "olivia.wright@example.com" },
    reportType: "other",
    reportOn: { name: "James Wilson", email: "james.wilson@example.com" },
    reason: "User is impersonating a well-known public figure and misleading followers.",
    reportPostID: "post-987",
    createdAt: "2025-10-08",
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  violations: "Violations",
  spam: "Spam",
  harassment: "Harassment",
  inappropriate_content: "Inappropriate Content",
  misinformation: "Misinformation",
  other: "Other",
}

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  resolved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  rejected:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
}

const REPORT_TYPE_STYLES: Record<ReportType, string> = {
  violations: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  spam: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  harassment: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  inappropriate_content: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  misinformation: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800",
  other: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserCell({ user }: { user: UserRef }) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-none truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-muted text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS)
  const [statusFilter, setStatusFilter] = useState<ReportStatus | null>(null)
  const [detailReport, setDetailReport] = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)

  // ── Derived counts ──
  const counts = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  }), [reports])

  // ── Filtered rows ──
  const filtered = useMemo(
    () => (statusFilter ? reports.filter((r) => r.status === statusFilter) : reports),
    [reports, statusFilter]
  )

  // ── Handlers ──
  function handleStatusChange(id: string, status: ReportStatus) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    setDetailReport((prev) => (prev?.id === id ? { ...prev, status } : prev))
  }

  function handleDelete(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id))
    setDeleteTarget(null)
    setDetailReport(null)
  }

  // ── Columns ──
  const columns: ColumnDef<Report>[] = [
    {
      title: "Reported By",
      key: "reportBy",
      renderItem: (record) => <UserCell user={record.reportBy} />,
    },
    {
      title: "Report Type",
      key: "reportType",
      renderItem: (record) => (
        <Badge variant="outline" className={`text-xs ${REPORT_TYPE_STYLES[record.reportType]}`}>
          {REPORT_TYPE_LABELS[record.reportType]}
        </Badge>
      ),
    },
    {
      title: "Reported On",
      key: "reportOn",
      renderItem: (record) => <UserCell user={record.reportOn} />,
    },
    {
      title: "Post",
      key: "reportPostID",
      renderItem: (record) => (
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {record.reportPostID}
        </span>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      renderItem: (record) => (
        <span className="text-sm text-muted-foreground">{record.createdAt}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      renderItem: (record) => (
        <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[record.status]}`}>
          {record.status}
        </Badge>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (record) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="View details"
            onClick={(e) => { e.stopPropagation(); setDetailReport(record) }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                title="Resolve"
                onClick={(e) => { e.stopPropagation(); handleStatusChange(record.id, "resolved") }}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Reject"
                onClick={(e) => { e.stopPropagation(); handleStatusChange(record.id, "rejected") }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(record) }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Reports" description="Review and act on user-submitted reports.">
      </PageHeader>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Reports", value: String(counts.total), icon: Bug, filter: null },
          { label: "Pending", value: String(counts.pending), icon: ClockArrowDown, filter: "pending" as ReportStatus },
          { label: "Resolved", value: String(counts.resolved), icon: ClockArrowUp, filter: "resolved" as ReportStatus },
          { label: "Rejected", value: String(counts.rejected), icon: SquareX, filter: "rejected" as ReportStatus },
        ].map((m) => (
          <div
            key={m.label}
            onClick={() => setStatusFilter((prev) => (prev === m.filter ? null : m.filter))}
            className={`cursor-pointer rounded-xl transition-all ring-offset-background ${
              statusFilter === m.filter ? "ring-2 ring-foreground/20" : ""
            }`}
          >
            <MetricCard
              title={m.label}
              value={m.value}
              isPositiveOutcome={true}
              icon={m.icon}
            />
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-medium">User Reports</CardTitle>
              <CardDescription>
                {statusFilter
                  ? `Showing ${filtered.length} ${statusFilter} report${filtered.length !== 1 ? "s" : ""}`
                  : `${reports.length} total reports`}
              </CardDescription>
            </div>
            {/* Status filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={statusFilter === null ? "default" : "outline"}
                onClick={() => setStatusFilter(null)}
                className={statusFilter === null ? "bg-foreground text-background" : "bg-transparent"}
              >
                All
              </Button>
              {(["pending", "resolved", "rejected"] as ReportStatus[]).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className={`capitalize ${statusFilter === s ? "bg-foreground text-background" : "bg-transparent"}`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(r) => r.id}
            onRowClick={(record) => setDetailReport(record)}
            emptyText="No reports match the current filter."
            meta={{ total: filtered.length, limit: 8, page: 1 }}
          />
        </CardContent>
      </Card>

      {/* ── Detail Dialog ── */}
      <Dialog open={!!detailReport} onOpenChange={(o) => !o && setDetailReport(null)}>
        <DialogContent className="max-w-lg">
          {detailReport && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 pr-6">
                  <div className="p-2 rounded-lg bg-muted mt-0.5">
                    <Bug className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-base leading-tight">
                      Report #{detailReport.id}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[detailReport.status]}`}>
                        {detailReport.status}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${REPORT_TYPE_STYLES[detailReport.reportType]}`}>
                        {REPORT_TYPE_LABELS[detailReport.reportType]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3.5 py-1">
                {/* Reported By */}
                <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Reported By">
                  <UserCell user={detailReport.reportBy} />
                </DetailRow>

                {/* Reported On */}
                <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Reported On">
                  <UserCell user={detailReport.reportOn} />
                </DetailRow>

                {/* Post ID */}
                <DetailRow icon={<ExternalLink className="w-3.5 h-3.5" />} label="Post Reference">
                  <span className="text-sm font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                    {detailReport.reportPostID}
                  </span>
                </DetailRow>

                {/* Date */}
                <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Submitted On">
                  <span className="text-sm text-foreground">{detailReport.createdAt}</span>
                </DetailRow>

                {/* Reason */}
                <DetailRow icon={<FileText className="w-3.5 h-3.5" />} label="Reason">
                  <div className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground leading-relaxed">
                    {detailReport.reason}
                  </div>
                </DetailRow>
              </div>

              <DialogFooter className="flex flex-wrap gap-2 sm:justify-between pt-1">
                {/* Destructive left side */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  onClick={() => { setDeleteTarget(detailReport); setDetailReport(null) }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>

                {/* Status actions right side */}
                <div className="flex gap-2">
                  {detailReport.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => handleStatusChange(detailReport.id, "rejected")}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleStatusChange(detailReport.id, "resolved")}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Resolve
                      </Button>
                    </>
                  )}
                  {detailReport.status === "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(detailReport.id, "pending")}
                    >
                      Reset to Pending
                    </Button>
                  )}
                  {detailReport.status === "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(detailReport.id, "pending")}
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              Report <span className="font-medium text-foreground">#{deleteTarget?.id}</span> submitted
              by <span className="font-medium text-foreground">{deleteTarget?.reportBy.name}</span> will
              be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}