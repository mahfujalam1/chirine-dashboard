"use client";

import { useEffect, useState } from "react";
import {
  SupportTicket,
  TicketStatus,
  TicketUser,
  useCloseSupportTicketMutation,
  useDeleteSupportTicketMutation,
  useGetSupportTicketsQuery,
  useReplySupportTicketMutation,
} from "@/lib/redux/services/customerSupportApis";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { SupportTicketDetailsDialog } from "@/components/dashboard/support/support-ticket-details-dialog";
import { SupportTicketReplyDialog } from "@/components/dashboard/support/support-ticket-reply-dialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDebounce } from "@/hooks/use-debounce";
import {
  CheckCircle,
  Clock,
  Eye,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<TicketStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-900/20 dark:text-amber-400",
  Replied: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-950 dark:bg-blue-900/20 dark:text-blue-400",
  Closed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-900/20 dark:text-emerald-400",
};

const fallbackAvatar =
  "https://static.vecteezy.com/system/resources/previews/042/332/098/non_2x/default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-socail-media-web-vector.jpg";

function formatDate(value: string) {
  if (!value) return "N/A";
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}

export default function SupportClientView() {
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  const [detailsTicket, setDetailsTicket] = useState<SupportTicket | null>(null);
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupportTicket | null>(null);

  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetSupportTicketsQuery({
      page,
      limit,
      ...(status && { status }),
      ...(debouncedSearch && { searchTerm: debouncedSearch }),
    });

  const [replyMutation, replyState] = useReplySupportTicketMutation();
  const [closeMutation, closeState] = useCloseSupportTicketMutation();
  const [deleteMutation, deleteState] = useDeleteSupportTicketMutation();

  const busy =
    replyState.isLoading || closeState.isLoading || deleteState.isLoading;

  async function handleReplySubmit(ticket: SupportTicket, replyMessage: string) {
    try {
      const res = await replyMutation({
        id: ticket._id,
        reply: replyMessage,
      }).unwrap();
      toast.success(res.message || "Reply sent successfully");
      setReplyTicket(null);
      if (detailsTicket?._id === ticket._id) {
        setDetailsTicket(res.data || null);
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to send reply"
      );
    }
  }

  async function handleCloseTicket(ticket: SupportTicket) {
    try {
      const res = await closeMutation({ id: ticket._id }).unwrap();
      toast.success(res.message || "Ticket closed successfully");
      if (detailsTicket?._id === ticket._id) {
        setDetailsTicket(res.data || null);
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to close ticket"
      );
    }
  }

  async function handleDeleteTicket() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (detailsTicket?._id === target._id) {
      setDetailsTicket(null);
    }
    try {
      const res = await deleteMutation({ id: target._id }).unwrap();
      toast.success(res.message || "Ticket deleted successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to delete ticket"
      );
    }
  }

  const columns: ColumnDef<SupportTicket>[] = [
    {
      title: "Requester",
      renderItem: (ticket) => {
        const userObj =
          typeof ticket.user === "object" && ticket.user !== null
            ? (ticket.user as TicketUser)
            : null;
        const name = ticket.requesterName || userObj?.fullName || "User";
        const email = ticket.requesterEmail || userObj?.email || "";
        const image = userObj?.profileImage || fallbackAvatar;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-border shrink-0">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden max-w-44">
              <p className="font-medium text-sm text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Ticket Details",
      renderItem: (ticket) => (
        <div className="max-w-xs md:max-w-md">
          <p className="font-semibold text-sm text-foreground truncate">{ticket.title}</p>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {ticket.description}
          </p>
        </div>
      ),
    },
    {
      title: "Date",
      renderItem: (ticket) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(ticket.createdAt)}
        </span>
      ),
    },
    {
      title: "Status",
      renderItem: (ticket) => (
        <Badge variant="outline" className={STATUS_STYLES[ticket.status]}>
          {ticket.status}
        </Badge>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (ticket) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            title="View Details"
            onClick={() => setDetailsTicket(ticket)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {ticket.status === "Pending" && (
            <Button
              size="icon"
              variant="ghost"
              title="Reply to Ticket"
              className="text-[#00ACA7] hover:bg-[#00ACA7]/10"
              disabled={busy}
              onClick={() => setReplyTicket(ticket)}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}

          {ticket.status !== "Closed" && (
            <Button
              size="icon"
              variant="ghost"
              title="Close Ticket"
              className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              disabled={busy}
              onClick={() => handleCloseTicket(ticket)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            title="Delete Ticket"
            className="text-destructive hover:bg-destructive/10"
            disabled={busy}
            onClick={() => setDeleteTarget(ticket)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalTickets = data?.meta?.total ?? data?.data?.length ?? 0;

  const metrics = [
    {
      label: "Total Support Tickets",
      value: totalTickets,
      icon: HelpCircle,
      filter: null,
    },
    {
      label: "Pending Action",
      value: data?.data?.filter((t) => t.status === "Pending").length ?? 0,
      icon: Clock,
      filter: "Pending" as TicketStatus,
    },
    {
      label: "Replied",
      value: data?.data?.filter((t) => t.status === "Replied").length ?? 0,
      icon: MessageSquare,
      filter: "Replied" as TicketStatus,
    },
    {
      label: "Closed",
      value: data?.data?.filter((t) => t.status === "Closed").length ?? 0,
      icon: CheckCircle,
      filter: "Closed" as TicketStatus,
    },
  ];

  return (
    <>
      <PageHeader
        title="Customer Support"
        description="View, manage, and respond to user customer support inquiries."
      />

      {/* Metrics Row */}
      <div className="mb-6 mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            className={`rounded text-left transition-all ${
              status === metric.filter
                ? "ring-2 ring-[#00ACA7] ring-offset-2"
                : ""
            }`}
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

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Support Tickets
              </CardTitle>
              <CardDescription>
                {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} found
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Filter Tabs */}
              <div className="flex gap-1 overflow-x-auto bg-muted/50 p-1 rounded-lg border border-border">
                {[null, "Pending", "Replied", "Closed"].map((item) => (
                  <Button
                    key={item ?? "All"}
                    size="sm"
                    variant={status === item ? "default" : "ghost"}
                    className={
                      status === item
                        ? "bg-[#00ACA7] text-white shadow-xs hover:bg-[#00ACA7]/90"
                        : "text-muted-foreground hover:text-foreground"
                    }
                    onClick={() => {
                      setStatus(item as TicketStatus | null);
                      setPage(1);
                    }}
                  >
                    {item ?? "All"}
                  </Button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets or users..."
                  className="w-full pl-9 sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center">
              <XCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="font-medium text-destructive">
                Unable to load customer support tickets
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please check your internet connection or try again.
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
              data={data?.data ?? []}
              columns={columns}
              rowKey={(ticket) => ticket._id}
              onRowClick={(ticket) => setDetailsTicket(ticket)}
              loading={isLoading || isFetching}
              emptyText="No customer support tickets found."
              meta={
                data?.meta
                  ? {
                      total: data.meta.total,
                      page: data.meta.page,
                      limit: data.meta.limit,
                    }
                  : undefined
              }
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <SupportTicketDetailsDialog
        ticket={detailsTicket}
        busy={busy}
        onClose={() => setDetailsTicket(null)}
        onReply={(ticket) => setReplyTicket(ticket)}
        onCloseTicket={handleCloseTicket}
        onDeleteTicket={(ticket) => setDeleteTarget(ticket)}
      />

      {/* Reply Modal */}
      <SupportTicketReplyDialog
        ticket={replyTicket}
        busy={replyState.isLoading}
        onClose={() => setReplyTicket(null)}
        onSubmitReply={handleReplySubmit}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Support Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be permanently deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteState.isLoading}
              onClick={handleDeleteTicket}
            >
              {deleteState.isLoading ? "Deleting..." : "Delete Ticket"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
