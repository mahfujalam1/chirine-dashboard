"use client"

import { EventForm } from "@/components/dashboard/EventForm"
import { PageHeader } from "@/components/dashboard/page-header"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ColumnDef, DataTable } from "@/components/ui/DataTable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BrainCog, Calendar, CheckCircle, Clock, Coffee, Eye, MapPin, Pencil, Plus, Radio, Speaker, Trash2, User, XCircle } from "lucide-react"
import { useState } from "react"


interface Event {
  id: string
  title: string
  event_image?: string
  event_type: "coffee_connect" | "social_event" | "lunch_and_learn"
  date: string
  start_time: string
  end_time: string
  location: string
  description: string
  status: "Pending" | "Approved" | "Rejected"
  speaker_name?: string
  requested_by?: string
  proposed_date?: string
  idea?: string
}

type EventFormData = Omit<Event, "id" | "status" | "requested_by" | "proposed_date" | "idea">


const SEED_EVENTS: Event[] = [
  {
    id: "1",
    title: "Morning Brew & Chat",
    event_type: "coffee_connect",
    date: "2025-11-10",
    start_time: "09:00 AM",
    end_time: "10:00 AM",
    location: "Room 3B, HQ",
    description: "An informal coffee meet-up for the team to connect and share ideas.",
    status: "Approved",
    requested_by: "Sarah Johnson",
    proposed_date: "2025-11-10",
    idea: "Casual coffee catchup to build team rapport",
  },
  {
    id: "2",
    title: "Autumn Social Mixer",
    event_type: "social_event",
    date: "2025-11-22",
    start_time: "06:00 PM",
    end_time: "09:00 PM",
    location: "Rooftop Lounge",
    description: "A seasonal social event for the whole company to unwind and enjoy.",
    status: "Pending",
    requested_by: "Mark Ellison",
    proposed_date: "2025-11-22",
    idea: "A rooftop event with drinks and live music",
  },
  {
    id: "3",
    title: "AI in Healthcare",
    event_type: "lunch_and_learn",
    date: "2025-12-05",
    start_time: "12:00 PM",
    end_time: "01:00 PM",
    location: "Conference Room A",
    description: "A lunchtime session exploring the latest trends in AI-driven healthcare solutions.",
    status: "Pending",
    speaker_name: "Dr. Emily Rhodes",
    requested_by: "Tom Baker",
    proposed_date: "2025-12-05",
    idea: "Deep dive into how AI is transforming healthcare",
  },
  {
    id: "4",
    title: "Friday Wind-Down",
    event_type: "coffee_connect",
    date: "2025-10-25",
    start_time: "04:30 PM",
    end_time: "05:30 PM",
    location: "Break Room",
    description: "End the week with a relaxed coffee and conversation session.",
    status: "Rejected",
    requested_by: "Lisa Nguyen",
    proposed_date: "2025-10-25",
    idea: "Weekly end-of-week decompression session",
  },
]


const EVENT_TYPE_LABELS: Record<string, string> = {
  coffee_connect: "Coffee Connect",
  social_event: "Social Event",
  lunch_and_learn: "Lunch & Learn",
}

const EVENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  coffee_connect: <Coffee className="w-4 h-4" />,
  social_event: <Radio className="w-4 h-4" />,
  lunch_and_learn: <BrainCog className="w-4 h-4" />,
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
}


function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-muted text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}



export default function EventsRequests() {
  const [events, setEvents] = useState<Event[]>(SEED_EVENTS)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)


  const [detailEvent, setDetailEvent] = useState<Event | null>(null)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)


  const counts = {
    coffee_connect: events.filter((e) => e.event_type === "coffee_connect").length,
    social_event: events.filter((e) => e.event_type === "social_event").length,
    lunch_and_learn: events.filter((e) => e.event_type === "lunch_and_learn").length,
  }


  const filtered = events.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false
    if (typeFilter && e.event_type !== typeFilter) return false
    return true
  })


  function handleCreate(data: EventFormData) {
    const newEvent: Event = {
      ...data,
      id: String(Date.now()),
      status: "Pending",
    }
    setEvents((prev) => [newEvent, ...prev])
    setCreateOpen(false)
  }

  function handleEdit(data: EventFormData) {
    if (!editEvent) return
    setEvents((prev) =>
      prev.map((e) => (e.id === editEvent.id ? { ...e, ...data } : e))
    )
    setEditEvent(null)
    setDetailEvent(null)
  }

  function handleStatusChange(id: string, status: "Approved" | "Rejected") {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
    setDetailEvent((prev) => (prev?.id === id ? { ...prev, status } : prev))
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setDeleteTarget(null)
    setDetailEvent(null)
  }


  const columns: ColumnDef<Event>[] = [
    {
      title: "Title",
      key: "title",
      renderItem: (record) => (
        <div className="font-medium text-sm text-foreground">{record.title}</div>
      ),
    },
    {
      title: "Type",
      key: "event_type",
      renderItem: (record) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {EVENT_TYPE_ICONS[record.event_type]}
          <span>{EVENT_TYPE_LABELS[record.event_type]}</span>
        </div>
      ),
    },
    {
      title: "Date",
      key: "date",
      renderItem: (record) => (
        <span className="text-sm text-muted-foreground">{record.date}</span>
      ),
    },
    {
      title: "Requested By",
      key: "requested_by",
      renderItem: (record) => (
        <span className="text-sm text-muted-foreground">{record.requested_by ?? "—"}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      renderItem: (record) => (
        <Badge variant="outline" className={STATUS_STYLES[record.status]}>
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
            onClick={(e) => { e.stopPropagation(); setDetailEvent(record) }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit event"
            onClick={(e) => { e.stopPropagation(); setEditEvent(record) }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete event"
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
      <PageHeader
        title="Events & Requests"
        description="Review user-submitted event requests and manage all events."
      >
        <Button
          variant="default"
          className="bg-(--color-primary) flex items-center gap-2 text-sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm">
          <Calendar className="w-4 h-4" />
          This Year
        </Button>
      </PageHeader>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { key: "coffee_connect", label: "Coffee Connect", icon: <Coffee className="w-4 h-4 text-muted-foreground" />, count: counts.coffee_connect },
          { key: "social_event", label: "Social Event", icon: <Radio className="w-4 h-4 text-muted-foreground" />, count: counts.social_event },
          { key: "lunch_and_learn", label: "Lunch & Learn", icon: <BrainCog className="w-4 h-4 text-muted-foreground" />, count: counts.lunch_and_learn },
        ].map(({ key, label, icon, count }) => (
          <Card
            key={key}
            onClick={() => setTypeFilter((prev) => (prev === key ? null : key))}
            className={`bg-card border border-border cursor-pointer transition-all hover:border-foreground/30 ${typeFilter === key ? "ring-2 ring-foreground/20 border-foreground/30" : ""}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="p-2 bg-muted rounded-lg">{icon}</div>
              </div>
              <p className="text-3xl font-semibold">{count}</p>
              <p className="text-xs text-muted-foreground mt-1">total events</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Table + Filters ── */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
              className={statusFilter === null ? "bg-foreground text-background" : "bg-transparent"}
            >
              All
            </Button>
            {(["Pending", "Approved", "Rejected"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? "bg-foreground text-background" : "bg-transparent"}
              >
                {s}
              </Button>
            ))}
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(r) => r.id}
            onRowClick={(record) => setDetailEvent(record)}
            emptyText="No events match the current filters."
            meta={{ total: filtered.length, limit: 8, page: 1 }}
          />
        </CardContent>
      </Card>

      {/* ── Detail Dialog ── */}
      <Dialog open={!!detailEvent} onOpenChange={(o) => !o && setDetailEvent(null)}>
        <DialogContent className="max-w-lg">
          {detailEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3 pr-6">
                  <div>
                    <DialogTitle className="text-lg leading-tight">{detailEvent.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs">
                        {EVENT_TYPE_LABELS[detailEvent.event_type]}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[detailEvent.status]}`}>
                        {detailEvent.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={detailEvent.date} />
                <DetailRow icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={`${detailEvent.start_time} – ${detailEvent.end_time}`} />
                <DetailRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={detailEvent.location} />
                {detailEvent.speaker_name && (
                  <DetailRow icon={<Speaker className="w-3.5 h-3.5" />} label="Speaker" value={detailEvent.speaker_name} />
                )}
                {detailEvent.requested_by && (
                  <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Requested By" value={detailEvent.requested_by} />
                )}
                {detailEvent.idea && (
                  <div className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">User's Ideas</p>
                    <p>{detailEvent.idea}</p>
                  </div>
                )}
                {detailEvent.description && (
                  <div className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                    <p>{detailEvent.description}</p>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                    onClick={() => { setDeleteTarget(detailEvent); setDetailEvent(null) }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditEvent(detailEvent)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                </div>
                {detailEvent.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      onClick={() => handleStatusChange(detailEvent.id, "Rejected")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleStatusChange(detailEvent.id, "Approved")}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Approve
                    </Button>
                  </div>
                )}
                {detailEvent.status !== "Pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(detailEvent.id, "Approved")}
                  >
                    Reset to Pending
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editEvent} onOpenChange={(o) => !o && setEditEvent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the event details below.</DialogDescription>
          </DialogHeader>
          {editEvent && (
            <EventForm
              isEdit
              initial={{
                title: editEvent.title,
                event_type: editEvent.event_type,
                date: editEvent.date,
                start_time: editEvent.start_time,
                end_time: editEvent.end_time,
                location: editEvent.location,
                description: editEvent.description,
                speaker_name: editEvent.speaker_name,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Fill in the details to add a new event.</DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">"{deleteTarget?.title}"</span> will be permanently removed.
              This action cannot be undone.
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