import { Report, ReportStatus } from "@/app/redux-query/services/reportApis"
import { ReportUserCell } from "@/components/dashboard/reports/report-user-cell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, CheckCircle, FileText, Trash2, User, XCircle } from "lucide-react"

const styles: Record<ReportStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

export function ReportDetailsDialog({ report, busy, onClose, onStatus, onDelete }: {
  report: Report | null
  busy: boolean
  onClose: () => void
  onStatus: (report: Report, status: "Resolved" | "Rejected") => void
  onDelete: (report: Report) => void
}) {
  return <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
    {report && <><DialogHeader><DialogTitle>{report.title}</DialogTitle><div className="flex flex-wrap gap-2 pt-1"><Badge variant="outline">{report.reportType}</Badge><Badge variant="outline" className={styles[report.status]}>{report.status}</Badge></div></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid gap-1 rounded border p-4 sm:grid-cols-2"><div><p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><User className="h-3.5 w-3.5" />Reported by</p><ReportUserCell user={report.reporter} /></div><div><p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><User className="h-3.5 w-3.5" />Reported user</p><ReportUserCell user={report.reportedUser} /></div></div>
        <div><p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><FileText className="h-3.5 w-3.5" />Description</p><p className="rounded bg-muted/60 p-4 text-sm leading-relaxed">{report.description}</p></div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2"><p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Submitted: {dateTime(report.createdAt)}</p><p>Updated: {dateTime(report.updatedAt)}</p></div>
      </div>
      <DialogFooter className="flex-wrap sm:justify-between"><Button variant="outline" className="text-destructive" disabled={busy} onClick={() => onDelete(report)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>{report.status === "Pending" && <div className="flex gap-2"><Button variant="outline" className="text-destructive" disabled={busy} onClick={() => onStatus(report, "Rejected")}><XCircle className="mr-2 h-4 w-4" />Reject</Button><Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={busy} onClick={() => onStatus(report, "Resolved")}><CheckCircle className="mr-2 h-4 w-4" />Resolve</Button></div>}</DialogFooter>
    </>}
  </DialogContent></Dialog>
}
