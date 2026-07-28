import { SocialEvent } from "@/app/redux-query/services/socialEventApis"
import { EventRow, EventType, isSocialEvent } from "@/components/dashboard/events/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColumnDef, DataTable } from "@/components/ui/DataTable"
import { ExternalLink, Pencil, Trash2 } from "lucide-react"

export function EventsTable({ rows, type, loading, emptyText, onEdit, onDelete, onParticipants }: {
  rows: EventRow[]
  type: EventType
  loading: boolean
  emptyText: string
  onEdit: (event: EventRow) => void
  onDelete: (event: EventRow) => void
  onParticipants: (event: SocialEvent) => void
}) {
  function viewParticipants(event: EventRow) {
    if (isSocialEvent(event.source)) onParticipants(event.source)
  }

  const columns: ColumnDef<EventRow>[] = [
    {
      title: "Event",
      renderItem: (event) => <div className="flex min-w-64 items-center gap-3">
        <img src={event.image} alt="" className="h-12 w-16 rounded bg-muted object-cover" />
        <div className="min-w-0"><p className="font-medium">{event.title}</p><p className="max-w-72 truncate text-xs text-muted-foreground">{event.description}</p></div>
      </div>,
    },
    { title: "Date", key: "date" },
    { title: "Time", key: "time" },
    { title: "Venue", key: "venue" },
    {
      title: "Participants",
      renderItem: (event) => type === "social" && isSocialEvent(event.source)
        ? <Button variant="link" className="h-auto p-0" onClick={() => viewParticipants(event)}>{event.participants} / {event.maxParticipants} · View</Button>
        : <span>{event.participants} / {event.maxParticipants}</span>,
    },
    {
      title: "Requirements",
      renderItem: (event) => event.requirements.length
        ? <div className="flex max-w-52 flex-wrap gap-1">{event.requirements.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      title: "Status",
      renderItem: (event) => <Badge variant={event.isExpired ? "secondary" : "outline"} className={!event.isExpired ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{event.isExpired ? "Expired" : "Active"}</Badge>,
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (event) => <div className="flex justify-end gap-1">
        {event.zoomJoinUrl && <Button asChild size="icon" variant="ghost" title="Open Zoom"><a href={event.zoomJoinUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
        <Button size="icon" variant="ghost" title="Edit event" onClick={() => onEdit(event)}><Pencil className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" title="Delete event" className="text-destructive hover:text-destructive" onClick={() => onDelete(event)}><Trash2 className="h-4 w-4" /></Button>
      </div>,
    },
  ]

  return <DataTable data={rows} columns={columns} rowKey={(event) => event.id} loading={loading} emptyText={emptyText} meta={{ total: rows.length, page: 1, limit: 10 }} />
}
