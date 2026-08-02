import {
  SupportTicket,
  TicketStatus,
  TicketUser,
} from "@/lib/redux/services/customerSupportApis";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Reply,
  Trash2,
  User,
} from "lucide-react";

const STATUS_STYLES: Record<TicketStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-900/20 dark:text-amber-400",
  Replied: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-950 dark:bg-blue-900/20 dark:text-blue-400",
  Closed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-900/20 dark:text-emerald-400",
};

const fallbackAvatar =
  "https://static.vecteezy.com/system/resources/previews/042/332/098/non_2x/default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-socail-media-web-vector.jpg";

function formatDateTime(value: string) {
  if (!value) return "N/A";
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

interface SupportTicketDetailsDialogProps {
  ticket: SupportTicket | null;
  busy: boolean;
  onClose: () => void;
  onReply: (ticket: SupportTicket) => void;
  onCloseTicket: (ticket: SupportTicket) => void;
  onDeleteTicket: (ticket: SupportTicket) => void;
}

export function SupportTicketDetailsDialog({
  ticket,
  busy,
  onClose,
  onReply,
  onCloseTicket,
  onDeleteTicket,
}: SupportTicketDetailsDialogProps) {
  if (!ticket) return null;

  const userObj =
    typeof ticket.user === "object" && ticket.user !== null
      ? (ticket.user as TicketUser)
      : null;
  const avatarUrl = userObj?.profileImage || fallbackAvatar;
  const displayName = ticket.requesterName || userObj?.fullName || "Anonymous User";
  const displayEmail = ticket.requesterEmail || userObj?.email || "No email provided";

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2 pr-4">
            <DialogTitle className="text-xl font-bold leading-snug">
              {ticket.title}
            </DialogTitle>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className={STATUS_STYLES[ticket.status]}>
              {ticket.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Requester Information */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Requester Info
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border shrink-0">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-semibold text-foreground truncate text-sm">
                  {displayName}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Description */}
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Description
            </p>
            <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Admin Reply Section if exists */}
          {ticket.reply && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  <Reply className="h-3.5 w-3.5" /> Admin Reply
                </p>
                {ticket.repliedAt && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(ticket.repliedAt)}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {ticket.reply}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 pt-1 border-t border-border">
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Created:{" "}
              {formatDateTime(ticket.createdAt)}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Updated:{" "}
              {formatDateTime(ticket.updatedAt)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            disabled={busy}
            onClick={() => onDeleteTicket(ticket)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
          </Button>

          <div className="flex flex-wrap gap-2 justify-end">
            {ticket.status !== "Closed" && (
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                disabled={busy}
                onClick={() => onCloseTicket(ticket)}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Close Ticket
              </Button>
            )}
            {ticket.status === "Pending" && (
              <Button
                className="bg-[#00ACA7] text-white hover:bg-[#00ACA7]/90"
                disabled={busy}
                onClick={() => onReply(ticket)}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Reply
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
