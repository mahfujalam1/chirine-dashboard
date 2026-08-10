import { SocialEvent } from "@/lib/redux/services/socialEventApis"
import { EventForm, EventFormData } from "@/components/dashboard/EventForm"
import { EventRow, EventTab } from "@/components/dashboard/events/types"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function EventFormDialog({ open, event, tab, saving, onOpenChange, onSubmit }: {
  open: boolean
  event: EventRow | null
  tab: EventTab
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: EventFormData) => Promise<void>
}) {
  const defaultTz = (typeof window !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC"
  const initial: EventFormData = event
    ? {
      title: event.title,
      event_type: tab.formType,
      date: event.date,
      start_time: event.source.startTime,
      end_time: event.source.endTime,
      timezone: event.source.timezone || defaultTz,
      location: event.venue === "Zoom" ? "" : event.venue,
      description: event.description
    }
    : {
      title: "",
      event_type: tab.formType,
      date: "",
      start_time: "",
      end_time: "",
      timezone: defaultTz,
      location: "",
      description: ""
    }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle><DialogDescription>{event ? "Update this published event." : `Create a new ${tab.label} event.`}</DialogDescription></DialogHeader><EventForm key={event?.id ?? tab.value} isEdit={!!event} initial={initial} existingImage={event?.image} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} isSubmitting={saving} /></DialogContent></Dialog>
}

export function ParticipantsDialog({ event, onClose }: { event: SocialEvent | null; onClose: () => void }) {
  return <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Social Event Participants</DialogTitle><DialogDescription>{event?.title} · {event?.participants.length ?? 0} registered</DialogDescription></DialogHeader><div className="space-y-3">{event?.participants.length ? event.participants.map((participant) => <div key={participant._id} className="flex items-start gap-3 rounded border p-4"><Avatar><AvatarImage src={participant.profileImage} /><AvatarFallback>{participant.fullName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{participant.fullName}</p><Badge variant="secondary">{participant.role}</Badge>{participant.isPremium && <Badge>Premium</Badge>}</div><p className="text-sm text-muted-foreground">{participant.email}</p><div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2"><p>License: {participant.licenseNo || "—"}</p><p>Phone: {participant.phone || "—"}</p><p>Location: {participant.location?.address || [participant.city, participant.country].filter(Boolean).join(", ") || "—"}</p><p>Status: {participant.isActive ? "Active" : "Inactive"}{participant.isBlocked ? " · Blocked" : ""}</p></div></div></div>) : <p className="py-8 text-center text-sm text-muted-foreground">No participants yet.</p>}</div></DialogContent></Dialog>
}

export function DeleteEventDialog({ event, deleting, onClose, onConfirm }: { event: EventRow | null; deleting: boolean; onClose: () => void; onConfirm: () => void }) {
  return <AlertDialog open={!!event} onOpenChange={(open) => !open && onClose()}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this event?</AlertDialogTitle><AlertDialogDescription>“{event?.title}” will be permanently deleted. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting} onClick={onConfirm}>{deleting ? "Deleting..." : "Delete event"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
}
