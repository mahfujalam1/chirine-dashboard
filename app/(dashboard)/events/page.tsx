"use client"

import { SocialEvent } from "@/app/redux-query/services/socialEventApis"
import { EventFormData } from "@/components/dashboard/EventForm"
import { DeleteEventDialog, EventFormDialog, ParticipantsDialog } from "@/components/dashboard/events/event-dialogs"
import { EventsTable } from "@/components/dashboard/events/event-table"
import { EVENT_TABS, EventRow, EventType } from "@/components/dashboard/events/types"
import { useEventManagement } from "@/components/dashboard/events/use-event-management"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, RefreshCw } from "lucide-react"
import { useState } from "react"

export default function EventsPage() {
  const [type, setType] = useState<EventType>("coffee")
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EventRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null)
  const [participantsEvent, setParticipantsEvent] = useState<SocialEvent | null>(null)
  const { rows, query, isSaving, isDeleting, save, remove } = useEventManagement(type)
  const currentTab = EVENT_TABS.find((tab) => tab.value === type)!

  function openCreateForm() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEditForm(event: EventRow) {
    setEditTarget(event)
    setFormOpen(true)
  }

  async function handleSave(data: EventFormData) {
    if (await save(data, editTarget)) {
      setFormOpen(false)
      setEditTarget(null)
    }
  }

  async function handleDelete() {
    if (deleteTarget && await remove(deleteTarget)) setDeleteTarget(null)
  }

  return <>
    <PageHeader title="Events" description="Create and manage published events by category.">
      <Button className="bg-[#00ACA7] text-white" onClick={openCreateForm}><Plus className="mr-2 h-4 w-4" />Add Event</Button>
    </PageHeader>

    <Card>
      <CardContent className="p-5">
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {EVENT_TABS.map((tab) => <Button key={tab.value} size="sm" variant={type === tab.value ? "default" : "outline"} className={type === tab.value ? "bg-[#00ACA7] text-white" : ""} onClick={() => setType(tab.value)}>{tab.label}</Button>)}
        </div>

        {query.isError ? <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"><p className="text-sm font-medium text-destructive">Unable to load {currentTab.label}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button></div> : <EventsTable rows={rows} type={type} loading={query.isLoading || query.isFetching} emptyText={`No ${currentTab.label} found.`} onEdit={openEditForm} onDelete={setDeleteTarget} onParticipants={setParticipantsEvent} />}
      </CardContent>
    </Card>

    <EventFormDialog open={formOpen} event={editTarget} tab={currentTab} saving={isSaving} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTarget(null) }} onSubmit={handleSave} />
    <ParticipantsDialog event={participantsEvent} onClose={() => setParticipantsEvent(null)} />
    <DeleteEventDialog event={deleteTarget} deleting={isDeleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
  </>
}
