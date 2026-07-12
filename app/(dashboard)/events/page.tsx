"use client"

import { CoffeConnectEvent, useCreateCoffeConnectMutation, useDeleteCoffeConnectMutation, useGetCoffeConnectQuery, useUpdateCoffeConnectMutation } from "@/app/redux-query/services/coffeConnectApis"
import { CreateEventPayload, UpdateEventPayload } from "@/app/redux-query/services/eventApiHelpers"
import { LunchAndLearnEvent, useCreateLunchAndLearnMutation, useDeleteLunchAndLearnMutation, useGetLunchAndLearnQuery, useUpdateLunchAndLearnMutation } from "@/app/redux-query/services/lunchAndLearnApis"
import { SocialEvent, useCreateSocialEventMutation, useDeleteSocialEventMutation, useGetSocialEventQuery, useUpdateSocialEventMutation } from "@/app/redux-query/services/socialEventApis"
import { EventForm } from "@/components/dashboard/EventForm"
import { PageHeader } from "@/components/dashboard/page-header"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ColumnDef, DataTable } from "@/components/ui/DataTable"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

type EventType = "coffee" | "social" | "lunch"
type EventRecord = CoffeConnectEvent | SocialEvent | LunchAndLearnEvent
type FormValue = { title: string; event_type: "coffee_connect" | "social_event" | "lunch_and_learn"; date: string; start_time: string; end_time: string; location: string; description: string; eventImage?: File }

interface EventRow {
  id: string; image: string; title: string; description: string; date: string; time: string; venue: string
  participants: number; maxParticipants: number; requirements: string[]; isExpired: boolean; zoomJoinUrl?: string; source: EventRecord
}

const TABS: { value: EventType; label: string; formType: FormValue["event_type"] }[] = [
  { value: "coffee", label: "Coffee Connect", formType: "coffee_connect" },
  { value: "social", label: "Social Events", formType: "social_event" },
  { value: "lunch", label: "Lunch & Learn", formType: "lunch_and_learn" },
]

export default function EventsPage() {
  const [type, setType] = useState<EventType>("coffee")
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EventRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null)
  const [participantsEvent, setParticipantsEvent] = useState<SocialEvent | null>(null)

  const coffeeQuery = useGetCoffeConnectQuery(undefined, { skip: type !== "coffee" })
  const socialQuery = useGetSocialEventQuery(undefined, { skip: type !== "social" })
  const lunchQuery = useGetLunchAndLearnQuery(undefined, { skip: type !== "lunch" })
  const query = type === "coffee" ? coffeeQuery : type === "social" ? socialQuery : lunchQuery

  const [createCoffee, createCoffeeState] = useCreateCoffeConnectMutation()
  const [createSocial, createSocialState] = useCreateSocialEventMutation()
  const [createLunch, createLunchState] = useCreateLunchAndLearnMutation()
  const [updateCoffee, updateCoffeeState] = useUpdateCoffeConnectMutation()
  const [updateSocial, updateSocialState] = useUpdateSocialEventMutation()
  const [updateLunch, updateLunchState] = useUpdateLunchAndLearnMutation()
  const [deleteCoffee, deleteCoffeeState] = useDeleteCoffeConnectMutation()
  const [deleteSocial, deleteSocialState] = useDeleteSocialEventMutation()
  const [deleteLunch, deleteLunchState] = useDeleteLunchAndLearnMutation()
  const isSaving = createCoffeeState.isLoading || createSocialState.isLoading || createLunchState.isLoading || updateCoffeeState.isLoading || updateSocialState.isLoading || updateLunchState.isLoading
  const isDeleting = deleteCoffeeState.isLoading || deleteSocialState.isLoading || deleteLunchState.isLoading

  const rows = useMemo<EventRow[]>(() => (query.data?.data ?? []).map((event) => ({
    id: event._id, image: event.image, title: event.title, description: event.description, date: event.date,
    time: `${event.startTime} – ${event.endTime}`, venue: "location" in event ? event.location : "Zoom",
    participants: event.participants.length, maxParticipants: event.maxParticipants,
    requirements: "entryRequirements" in event ? event.entryRequirements : [], isExpired: event.isExpired,
    zoomJoinUrl: "zoomJoinUrl" in event ? event.zoomJoinUrl : undefined, source: event,
  })), [query.data])

  function payloadFromForm(data: FormValue): UpdateEventPayload {
    return { eventImage: data.eventImage, title: data.title.trim(), description: data.description.trim(), date: data.date, startTime: data.start_time, endTime: data.end_time }
  }

  async function handleSave(data: FormValue) {
    try {
      const payload = payloadFromForm(data)
      let response: any
      if (editTarget) {
        response = type === "coffee" ? await updateCoffee({ eventId: editTarget.id, data: payload }).unwrap()
          : type === "social" ? await updateSocial({ eventId: editTarget.id, data: payload }).unwrap()
          : await updateLunch({ eventId: editTarget.id, data: payload }).unwrap()
      } else {
        if (!data.eventImage) {
          toast.error("Please select an event image")
          return
        }
        const createPayload = payload as CreateEventPayload
        response = data.event_type === "coffee_connect" ? await createCoffee(createPayload).unwrap()
          : data.event_type === "social_event" ? await createSocial(createPayload).unwrap()
          : await createLunch(createPayload).unwrap()
      }
      toast.success(response?.message || `Event ${editTarget ? "updated" : "created"} successfully`)
      setFormOpen(false); setEditTarget(null)
    } catch (error: any) { toast.error(error?.data?.message || error?.message || "Unable to save event") }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const response: any = type === "coffee" ? await deleteCoffee(deleteTarget.id).unwrap()
        : type === "social" ? await deleteSocial(deleteTarget.id).unwrap()
        : await deleteLunch(deleteTarget.id).unwrap()
      toast.success(response?.message || "Event deleted successfully"); setDeleteTarget(null)
    } catch (error: any) { toast.error(error?.data?.message || error?.message || "Unable to delete event") }
  }

  const columns: ColumnDef<EventRow>[] = [
    { title: "Event", renderItem: (event) => <div className="flex min-w-64 items-center gap-3"><img src={event.image} alt="" className="h-12 w-16 rounded-md bg-muted object-cover" /><div className="min-w-0"><p className="font-medium">{event.title}</p><p className="max-w-72 truncate text-xs text-muted-foreground">{event.description}</p></div></div> },
    { title: "Date", key: "date" }, { title: "Time", key: "time" }, { title: "Venue", key: "venue" },
    { title: "Participants", renderItem: (event) => type === "social" ? <Button variant="link" className="h-auto p-0" onClick={() => setParticipantsEvent(event.source as SocialEvent)}>{event.participants} / {event.maxParticipants} · View</Button> : <span>{event.participants} / {event.maxParticipants}</span> },
    { title: "Requirements", renderItem: (event) => event.requirements.length ? <div className="flex max-w-52 flex-wrap gap-1">{event.requirements.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div> : <span className="text-muted-foreground">—</span> },
    { title: "Status", renderItem: (event) => <Badge variant={event.isExpired ? "secondary" : "outline"} className={!event.isExpired ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{event.isExpired ? "Expired" : "Active"}</Badge> },
    { title: "Actions", align: "right", renderItem: (event) => <div className="flex justify-end gap-1">{event.zoomJoinUrl && <Button asChild size="icon" variant="ghost" title="Open Zoom"><a href={event.zoomJoinUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}<Button size="icon" variant="ghost" title="Edit event" onClick={() => { setEditTarget(event); setFormOpen(true) }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Delete event" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(event)}><Trash2 className="h-4 w-4" /></Button></div> },
  ]

  const currentTab = TABS.find((tab) => tab.value === type)!
  return <>
    <PageHeader title="Events" description="Create and manage published events by category."><Button className="bg-[#00ACA7] text-white" onClick={() => { setEditTarget(null); setFormOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add Event</Button></PageHeader>
    <Card><CardContent className="p-5"><div className="mb-5 flex gap-2 overflow-x-auto">{TABS.map((tab) => <Button key={tab.value} size="sm" variant={type === tab.value ? "default" : "outline"} className={type === tab.value ? "bg-[#00ACA7] text-white" : ""} onClick={() => setType(tab.value)}>{tab.label}</Button>)}</div>{query.isError && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Unable to load events.</div>}<DataTable data={rows} columns={columns} rowKey={(event) => event.id} loading={query.isLoading || query.isFetching} emptyText={`No ${currentTab.label} found.`} meta={{ total: rows.length, page: 1, limit: 10 }} /></CardContent></Card>

    <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTarget(null) }}><DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{editTarget ? "Edit Event" : "Create Event"}</DialogTitle><DialogDescription>{editTarget ? "Update this published event." : `Create a new ${currentTab.label} event.`}</DialogDescription></DialogHeader><EventForm key={editTarget?.id ?? currentTab.value} isEdit={!!editTarget} initial={editTarget ? { title: editTarget.title, event_type: currentTab.formType, date: editTarget.date, start_time: editTarget.source.startTime, end_time: editTarget.source.endTime, location: editTarget.venue === "Zoom" ? "" : editTarget.venue, description: editTarget.description } : { title: "", event_type: currentTab.formType, date: "", start_time: "", end_time: "", location: "", description: "" }} onSubmit={handleSave} onCancel={() => setFormOpen(false)} isSubmitting={isSaving} /></DialogContent></Dialog>

    <Dialog open={!!participantsEvent} onOpenChange={(open) => !open && setParticipantsEvent(null)}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Social Event Participants</DialogTitle><DialogDescription>{participantsEvent?.title} · {participantsEvent?.participants.length ?? 0} registered</DialogDescription></DialogHeader><div className="space-y-3">{participantsEvent?.participants.length ? participantsEvent.participants.map((participant) => <div key={participant._id} className="flex items-start gap-3 rounded-xl border p-4"><Avatar><AvatarImage src={participant.profileImage} /><AvatarFallback>{participant.fullName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{participant.fullName}</p><Badge variant="secondary">{participant.role}</Badge>{participant.isPremium && <Badge>Premium</Badge>}</div><p className="text-sm text-muted-foreground">{participant.email}</p><div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2"><p>License: {participant.licenseNo || "—"}</p><p>Phone: {participant.phone || "—"}</p><p>Location: {participant.location?.address || [participant.city, participant.country].filter(Boolean).join(", ") || "—"}</p><p>Status: {participant.isActive ? "Active" : "Inactive"}{participant.isBlocked ? " · Blocked" : ""}</p></div></div></div>) : <p className="py-8 text-center text-sm text-muted-foreground">No participants yet.</p>}</div></DialogContent></Dialog>

    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this event?</AlertDialogTitle><AlertDialogDescription>“{deleteTarget?.title}” will be permanently deleted. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting} onClick={handleDelete}>{isDeleting ? "Deleting..." : "Delete event"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>
}
