"use client";

import { PageHeader } from "@/components/dashboard/page-header";
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
import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef, DataTable } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  RequestEvent,
  useDeleteRequestEventMutation,
  useGetAllRequestEventsQuery,
  useUpdateEventStatusMutation,
} from "@/lib/redux/services/eventApis";
import { useUpdateLunchAndLearnMutation } from "@/lib/redux/services/lunchAndLearnApis";
import {
  BrainCog,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Eye,
  Globe2,
  Loader2,
  Mic,
  Radio,
  Search,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  formatUsCalendarDate,
  formatUsDateTime,
  formatUsTime,
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/date-utils";

const EVENT_LABELS: Record<RequestEvent["eventType"], string> = {
  CoffeeConnect: "Coffee Connect",
  SocialEvent: "Social Event",
  LunchAndLearn: "HotCast",
};

const STATUS_STYLES: Record<RequestEvent["status"], string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

import { useDebounce } from "@/hooks/use-debounce";

export default function EventRequestsClientView() {
  const [status, setStatus] = useState<RequestEvent["status"] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);
  const [selectedEvent, setSelectedEvent] = useState<RequestEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RequestEvent | null>(null);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useGetAllRequestEventsQuery({
    page,
    limit,
    ...(status && { status }),
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
  });
  const [updateStatus, updateState] = useUpdateEventStatusMutation();
  const [deleteEvent, deleteState] = useDeleteRequestEventMutation();
  const [updateLunchAndLearn, updateLunchState] = useUpdateLunchAndLearnMutation();

  const [speakerModalOpen, setSpeakerModalOpen] = useState(false);
  const [speakerEvent, setSpeakerEvent] = useState<{
    event: RequestEvent;
    eventId: string;
  } | null>(null);
  const [speakerName, setSpeakerName] = useState("");

  async function handleStatusChange(
    event: RequestEvent,
    nextStatus: "Accepted" | "Rejected",
  ) {
    try {
      const response = await updateStatus({
        eventId: event._id,
        status: nextStatus,
      }).unwrap();
      toast.success(
        response?.message || `Request ${nextStatus.toLowerCase()} successfully`,
      );
      setSelectedEvent(null);

      // If approving a HotCast / LunchAndLearn event, immediately show input modal for speakerName
      if (nextStatus === "Accepted" && event.eventType === "LunchAndLearn") {
        const targetEventId =
          response?.data?.eventId ||
          response?.data?._id ||
          event._id;

        setSpeakerEvent({
          event,
          eventId: targetEventId,
        });
        setSpeakerName((event as any).speakerName || "");
        setSpeakerModalOpen(true);
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        error?.message ||
        "Unable to update request status",
      );
    }
  }

  async function handleSpeakerSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!speakerEvent) return;

    if (!speakerName.trim()) {
      toast.error("Please enter a speaker name.");
      return;
    }

    try {
      const defaultTz =
        (typeof window !== "undefined" &&
          Intl.DateTimeFormat().resolvedOptions().timeZone) ||
        "UTC";

      const payload = {
        title: speakerEvent.event.title,
        description: speakerEvent.event.description,
        date:
          toDateInputValue(speakerEvent.event.date) || speakerEvent.event.date,
        startTime:
          toTimeInputValue(speakerEvent.event.startTime) ||
          speakerEvent.event.startTime,
        endTime:
          toTimeInputValue(speakerEvent.event.endTime) ||
          speakerEvent.event.endTime,
        timezone: speakerEvent.event.timezone || defaultTz,
        speakerName: speakerName.trim(),
      };

      const updateRes: any = await updateLunchAndLearn({
        eventId: speakerEvent.eventId,
        data: payload,
      }).unwrap();

      toast.success(
        updateRes?.message || "Speaker assigned and event updated successfully!",
      );
      setSpeakerModalOpen(false);
      setSpeakerEvent(null);
      setSpeakerName("");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update speaker name",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await deleteEvent({
        eventId: deleteTarget._id,
      }).unwrap();
      toast.success(response?.message || "Request deleted successfully");
      setDeleteTarget(null);
      setSelectedEvent(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Unable to delete request",
      );
    }
  }

  const columns: ColumnDef<RequestEvent>[] = [
    {
      title: "Event",
      renderItem: (event) => (
        <div className="flex min-w-64 items-center gap-3">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            width={64}
            height={48}
            className="h-12 w-16 rounded bg-muted object-cover"
          />
          <div className="min-w-0">
            <p className="font-medium">{event.title}</p>
            <p className="max-w-64 truncate text-xs text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      renderItem: (event) => <span>{EVENT_LABELS[event.eventType]}</span>,
    },
    { title: "Date", renderItem: (event) => formatUsCalendarDate(event.date) },
    {
      title: "Requested By",
      renderItem: (event) => (
        <div>
          <p className="text-sm font-medium">{event.user.fullName}</p>
          <p className="text-xs text-muted-foreground">{event.user.email}</p>
        </div>
      ),
    },
    {
      title: "Status",
      renderItem: (event) => (
        <Badge variant="outline" className={STATUS_STYLES[event.status]}>
          {event.status}
        </Badge>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (event) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="View details"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete request"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(event);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = data?.data.stats;
  return (
    <>
      <PageHeader
        title="Event Requests"
        description="Review event requests submitted by users and approve or reject them."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Coffee Connect",
            count: stats?.coffeeConnectEvents ?? 0,
            icon: <Coffee className="h-4 w-4" />,
          },
          {
            label: "Social Event",
            count: stats?.socialEvents ?? 0,
            icon: <Radio className="h-4 w-4" />,
          },
          {
            label: "HotCast",
            count: stats?.lunchAndLearnEvents ?? 0,
            icon: <BrainCog className="h-4 w-4" />,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>{item.label}</span>
                <span className="rounded bg-muted p-2">{item.icon}</span>
              </div>
              <p className="text-3xl font-semibold">{item.count}</p>
              <p className="mt-1 text-xs text-muted-foreground">requests</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {[null, "Pending", "Accepted", "Rejected"].map((item) => (
                <Button
                  key={item ?? "All"}
                  size="sm"
                  variant={status === item ? "default" : "outline"}
                  className={
                    status === item ? "bg-foreground text-background" : ""
                  }
                  onClick={() => {
                    setStatus(item as RequestEvent["status"] | null);
                    setPage(1);
                  }}
                >
                  {item ?? "All"}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requests..."
                className="pl-9"
              />
            </div>
          </div>
          <DataTable
            data={data?.data.result ?? []}
            columns={columns}
            rowKey={(event) => event._id}
            onRowClick={setSelectedEvent}
            loading={isLoading || isFetching}
            emptyText="No event requests found."
            meta={{
              total: data?.data.meta.total ?? 0,
              page: data?.data.meta.page ?? page,
              limit: data?.data.meta.limit ?? limit,
            }}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
          {selectedEvent && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
              {/* Hero image */}
              {selectedEvent.image ? (
                <div className="relative h-52 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                  />
                  {/* Gradient overlay for title readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <Badge className="border-white/30 bg-white/15 text-white backdrop-blur-sm">
                        {EVENT_LABELS[selectedEvent.eventType]}
                      </Badge>
                      <Badge
                        className={`backdrop-blur-sm ${STATUS_STYLES[selectedEvent.status]}`}
                      >
                        {selectedEvent.status}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold leading-tight text-white drop-shadow">
                      {selectedEvent.title}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="px-6 pb-0 pt-6">
                  <DialogHeader>
                    <div className="pr-8">
                      <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline">
                          {EVENT_LABELS[selectedEvent.eventType]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={STATUS_STYLES[selectedEvent.status]}
                        >
                          {selectedEvent.status}
                        </Badge>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
              )}

              <div className="space-y-4 px-5 pb-5 pt-4">
                {/* Requester info card */}
                <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4">
                  {selectedEvent.user.profileImage ? (
                    <Image
                      src={selectedEvent.user.profileImage}
                      alt={selectedEvent.user.fullName}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-background"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 ring-2 ring-background">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      Requested by
                    </p>
                    <p className="truncate font-semibold">{selectedEvent.user.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{selectedEvent.user.email}</p>
                  </div>
                </div>

                {/* iOS-style info grid with divide lines */}
                <div className="overflow-hidden rounded-2xl border">
                  {/* Row 1 – Date | Time */}
                  <div className="grid divide-x sm:grid-cols-2">
                    <div className="flex items-start gap-3 p-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Date
                        </p>
                        <p className="mt-0.5 font-semibold">
                          {formatUsCalendarDate(selectedEvent.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-950">
                        <Clock className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Time
                        </p>
                        <p className="mt-0.5 font-semibold">
                          {formatUsTime(selectedEvent.startTime)} – {formatUsTime(selectedEvent.endTime)}
                        </p>
                        {selectedEvent.timezone && (
                          <p className="text-[11px] text-muted-foreground">
                            {selectedEvent.timezone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal divider */}
                  <div className="border-t" />

                  {/* Row 2 – Participants | Format */}
                  <div className="grid divide-x sm:grid-cols-2">
                    <div className="flex items-start gap-3 p-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                        <Users className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Max Participants
                        </p>
                        <p className="mt-0.5 font-semibold">
                          {selectedEvent.maxParticipants ?? "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950">
                        <Globe2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Format
                        </p>
                        <p className="mt-0.5 font-semibold">
                          {selectedEvent.isOnline ? "Online" : "In Person"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="overflow-hidden rounded-2xl border">
                  <div className="border-b bg-muted/40 px-4 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      Description
                    </p>
                  </div>
                  <p className="p-4 text-sm leading-relaxed text-foreground/80">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Entry requirements */}
                <div className="overflow-hidden rounded-2xl border">
                  <div className="border-b bg-muted/40 px-4 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      Entry Requirements
                    </p>
                  </div>
                  <div className="p-4">
                    {selectedEvent.entryRequirements?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.entryRequirements.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No entry requirements
                      </p>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid gap-2 rounded-2xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:grid-cols-2">
                  <p>
                    <span className="font-medium">Submitted:</span>{" "}
                    {formatUsDateTime(selectedEvent.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Last updated:</span>{" "}
                    {formatUsDateTime(selectedEvent.updatedAt)}
                  </p>
                </div>
              </div>
              {/* end flex-1 scroll area */}
              </div>

              {/* Sticky action footer — always visible */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <Button
                  variant="outline"
                  className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                  onClick={() => {
                    setDeleteTarget(selectedEvent);
                    setSelectedEvent(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                {selectedEvent.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                      disabled={updateState.isLoading}
                      onClick={() =>
                        handleStatusChange(selectedEvent, "Rejected")
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={updateState.isLoading}
                      onClick={() =>
                        handleStatusChange(selectedEvent, "Accepted")
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event request?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                “{deleteTarget?.title}”
              </span>{" "}
              will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteState.isLoading}
              onClick={handleDelete}
            >
              {deleteState.isLoading ? "Deleting..." : "Delete request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Speaker Input Modal for Approved HotCast / LunchAndLearn Events */}
      <Dialog
        open={speakerModalOpen}
        onOpenChange={(open) => {
          if (!updateLunchState.isLoading) {
            setSpeakerModalOpen(open);
            if (!open) {
              setSpeakerEvent(null);
              setSpeakerName("");
            }
          }
        }}
      >
        <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0 shadow-2xl">
          <form onSubmit={handleSpeakerSubmit}>
            <div className="border-b bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/20">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-foreground">
                    Assign Speaker
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    HotCast event approved. Set the speaker name for this session.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {speakerEvent && (
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
                  <p className="font-medium text-foreground text-sm line-clamp-1">
                    {speakerEvent.event.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                      {formatUsCalendarDate(speakerEvent.event.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      {formatUsTime(speakerEvent.event.startTime)} – {formatUsTime(speakerEvent.event.endTime)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="speaker-name-input"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Speaker Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="speaker-name-input"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    placeholder="e.g., Dr. Jane Smith"
                    className="h-10 rounded-xl border-border/80 pl-9 pr-3 text-sm focus-visible:ring-emerald-500"
                    autoFocus
                    disabled={updateLunchState.isLoading}
                  />
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This speaker will be shown to attendees on the event details page.
                </p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 border-t bg-muted/20 px-5 py-3.5">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                disabled={updateLunchState.isLoading}
                onClick={() => {
                  setSpeakerModalOpen(false);
                  setSpeakerEvent(null);
                  setSpeakerName("");
                }}
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm"
                disabled={updateLunchState.isLoading || !speakerName.trim()}
              >
                {updateLunchState.isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Save & Update
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
