"use client"

import {
  RequestEvent,
  useDeleteRequestEventMutation,
  useGetAllRequestEventsQuery,
  useUpdateEventStatusMutation,
} from "@/app/redux-query/services/eventApis"
import { PageHeader } from "@/components/dashboard/page-header"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ColumnDef, DataTable } from "@/components/ui/DataTable"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { BrainCog, Calendar, CheckCircle, Clock, Coffee, Eye, Globe2, Mail, Radio, Search, Trash2, User, Users, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const EVENT_LABELS: Record<RequestEvent["eventType"], string> = {
  CoffeeConnect: "Coffee Connect",
  SocialEvent: "Social Event",
  LunchAndLearn: "Lunch & Learn",
}

const STATUS_STYLES: Record<RequestEvent["status"], string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

export default function EventRequestsPage() {
  const [status, setStatus] = useState<RequestEvent["status"] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<RequestEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RequestEvent | null>(null)
  const limit = 10

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
      setPage(1)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading, isFetching } = useGetAllRequestEventsQuery({
    page,
    limit,
    ...(status && { status }),
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
  })
  const [updateStatus, updateState] = useUpdateEventStatusMutation()
  const [deleteEvent, deleteState] = useDeleteRequestEventMutation()

  async function handleStatusChange(event: RequestEvent, nextStatus: "Accepted" | "Rejected") {
    try {
      const response = await updateStatus({ eventId: event._id, status: nextStatus }).unwrap()
      toast.success(response?.message || `Request ${nextStatus.toLowerCase()} successfully`)
      setSelectedEvent(null)
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Unable to update request status")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const response = await deleteEvent({ eventId: deleteTarget._id }).unwrap()
      toast.success(response?.message || "Request deleted successfully")
      setDeleteTarget(null)
      setSelectedEvent(null)
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Unable to delete request")
    }
  }

  const columns: ColumnDef<RequestEvent>[] = [
    {
      title: "Event",
      renderItem: (event) => <div className="flex min-w-64 items-center gap-3">
        <img src={event.image} alt="" className="h-12 w-16 rounded bg-muted object-cover" />
        <div className="min-w-0"><p className="font-medium">{event.title}</p><p className="max-w-64 truncate text-xs text-muted-foreground">{event.description}</p></div>
      </div>,
    },
    { title: "Type", renderItem: (event) => <span>{EVENT_LABELS[event.eventType]}</span> },
    { title: "Date", key: "date" },
    {
      title: "Requested By",
      renderItem: (event) => <div><p className="text-sm font-medium">{event.user.fullName}</p><p className="text-xs text-muted-foreground">{event.user.email}</p></div>,
    },
    { title: "Status", renderItem: (event) => <Badge variant="outline" className={STATUS_STYLES[event.status]}>{event.status}</Badge> },
    {
      title: "Actions",
      align: "right",
      renderItem: (event) => <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" title="View details" onClick={(e) => { e.stopPropagation(); setSelectedEvent(event) }}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" title="Delete request" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(event) }}><Trash2 className="h-4 w-4" /></Button>
      </div>,
    },
  ]

  const stats = data?.data.stats
  return <>
    <PageHeader title="Event Requests" description="Review event requests submitted by users and approve or reject them." />

    <div className="mb-1 grid gap-1 sm:grid-cols-3">
      {[
        { label: "Coffee Connect", count: stats?.coffeeConnectEvents ?? 0, icon: <Coffee className="h-4 w-4" /> },
        { label: "Social Event", count: stats?.socialEvents ?? 0, icon: <Radio className="h-4 w-4" /> },
        { label: "Lunch & Learn", count: stats?.lunchAndLearnEvents ?? 0, icon: <BrainCog className="h-4 w-4" /> },
      ].map((item) => <Card key={item.label}><CardContent className="p-5"><div className="mb-3 flex items-center justify-between text-sm text-muted-foreground"><span>{item.label}</span><span className="rounded bg-muted p-2">{item.icon}</span></div><p className="text-3xl font-semibold">{item.count}</p><p className="mt-1 text-xs text-muted-foreground">requests</p></CardContent></Card>)}
    </div>

    <Card><CardContent className="p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {[null, "Pending", "Accepted", "Rejected"].map((item) => <Button key={item ?? "All"} size="sm" variant={status === item ? "default" : "outline"} className={status === item ? "bg-foreground text-background" : ""} onClick={() => { setStatus(item as RequestEvent["status"] | null); setPage(1) }}>{item ?? "All"}</Button>)}
        </div>
        <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search requests..." className="pl-9" /></div>
      </div>
      <DataTable data={data?.data.result ?? []} columns={columns} rowKey={(event) => event._id} onRowClick={setSelectedEvent} loading={isLoading || isFetching} emptyText="No event requests found." meta={{ total: data?.data.meta.total ?? 0, page: data?.data.meta.page ?? page, limit: data?.data.meta.limit ?? limit }} onPageChange={setPage} />
    </CardContent></Card>

    <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {selectedEvent && <>
          <DialogHeader><div className="pr-8"><DialogTitle>{selectedEvent.title}</DialogTitle><div className="mt-2 flex gap-2"><Badge variant="outline">{EVENT_LABELS[selectedEvent.eventType]}</Badge><Badge variant="outline" className={STATUS_STYLES[selectedEvent.status]}>{selectedEvent.status}</Badge></div></div></DialogHeader>
          {selectedEvent.image && <img src={selectedEvent.image} alt={selectedEvent.title} className="max-h-72 w-full rounded bg-muted object-cover" />}
          <div className="grid gap-1 rounded border p-4 sm:grid-cols-2">
            <div className="flex gap-3"><User className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Requested by</p><p className="font-medium">{selectedEvent.user.fullName}</p></div></div>
            <div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{selectedEvent.user.email}</p></div></div>
            <div className="flex gap-3"><Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{selectedEvent.date}</p></div></div>
            <div className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Time</p><p className="font-medium">{selectedEvent.startTime} – {selectedEvent.endTime}</p></div></div>
            <div className="flex gap-3"><Users className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Maximum participants</p><p className="font-medium">{selectedEvent.maxParticipants ?? "Not specified"}</p></div></div>
            <div className="flex gap-3"><Globe2 className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Format</p><p className="font-medium">{selectedEvent.isOnline ? "Online" : "In person"}</p></div></div>
          </div>
          <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p><p className="rounded bg-muted/60 p-4 text-sm">{selectedEvent.description}</p></div>
          <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Entry requirements</p>{selectedEvent.entryRequirements?.length ? <div className="flex flex-wrap gap-2">{selectedEvent.entryRequirements.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div> : <p className="text-sm text-muted-foreground">No entry requirements</p>}</div>
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2"><p>Submitted: {formatDateTime(selectedEvent.createdAt)}</p><p>Last updated: {formatDateTime(selectedEvent.updatedAt)}</p></div>
          <DialogFooter className="flex-wrap sm:justify-between">
            <Button variant="outline" className="text-destructive" onClick={() => { setDeleteTarget(selectedEvent); setSelectedEvent(null) }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            {selectedEvent.status === "Pending" && <div className="flex gap-2"><Button variant="outline" className="text-destructive" disabled={updateState.isLoading} onClick={() => handleStatusChange(selectedEvent, "Rejected")}><XCircle className="mr-2 h-4 w-4" />Reject</Button><Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={updateState.isLoading} onClick={() => handleStatusChange(selectedEvent, "Accepted")}><CheckCircle className="mr-2 h-4 w-4" />Approve</Button></div>}
          </DialogFooter>
        </>}
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this event request?</AlertDialogTitle><AlertDialogDescription><span className="font-medium text-foreground">“{deleteTarget?.title}”</span> will be permanently deleted. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleteState.isLoading}>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteState.isLoading} onClick={handleDelete}>{deleteState.isLoading ? "Deleting..." : "Delete request"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>
}
