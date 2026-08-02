"use client";

import { useEffect, useState } from "react";
import { SupportTicket } from "@/lib/redux/services/customerSupportApis";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";

interface SupportTicketReplyDialogProps {
  ticket: SupportTicket | null;
  busy: boolean;
  onClose: () => void;
  onSubmitReply: (ticket: SupportTicket, replyMessage: string) => Promise<void>;
}

export function SupportTicketReplyDialog({
  ticket,
  busy,
  onClose,
  onSubmitReply,
}: SupportTicketReplyDialogProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ticket) {
      setReplyMessage(ticket.reply || "");
      setError("");
    }
  }, [ticket]);

  if (!ticket) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = replyMessage.trim();
    if (!trimmed) {
      setError("Please enter a reply message.");
      return;
    }
    setError("");
    await onSubmitReply(ticket!, trimmed);
  }

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Reply to Customer Support Ticket
            </DialogTitle>
            <DialogDescription className="pt-1">
              Replying to <span className="font-semibold text-foreground">{ticket.requesterName}</span> regarding:{" "}
              <span className="italic text-foreground">“{ticket.title}”</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Original Request: </span>
              {ticket.description}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="replyMessage" className="text-sm font-medium">
                Admin Response <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="replyMessage"
                rows={5}
                placeholder="Type your response to the user here..."
                value={replyMessage}
                disabled={busy}
                onChange={(e) => {
                  setReplyMessage(e.target.value);
                  if (error) setError("");
                }}
                className="resize-none"
              />
              {error && <p className="text-xs font-medium text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || !replyMessage.trim()}
              className="bg-[#00ACA7] text-white hover:bg-[#00ACA7]/90"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
