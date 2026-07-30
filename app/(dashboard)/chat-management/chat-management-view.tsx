"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef, DataTable } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Eye,
  MessageCircleMore,
  Search,
  ShieldCheck,
  ShieldOff,
  Users,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Ban,
  UserCheck,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { getErrorMessage, getStatusColor } from "@/lib/utils";
import {
  useBlockUnblockMutation,
  useGetChatsListQuery,
  ChatItem,
} from "@/lib/redux/services/chatsApis";
import { toast } from "sonner";

type StatusFilter = "All" | "Active" | "Blocked";

export default function ChatManagementClientView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [actionChat, setActionChat] = useState<{
    chat: ChatItem;
    action: "block" | "unblock";
  } | null>(null);

  // Reset page to 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearchQuery]);

  // RTK Query hooks
  const { data, isLoading, isFetching, isError, refetch } =
    useGetChatsListQuery({
      status: statusFilter,
      searchTerm: debouncedSearchQuery,
      page,
      limit: 10,
    });

  const [blockUnblock, { isLoading: isMutating }] = useBlockUnblockMutation();

  const chats = useMemo(() => data?.data?.result ?? [], [data]);
  const stats = data?.data?.stats;
  const meta = data?.data?.meta;

  const handleBlockToggle = useCallback(async () => {
    if (!actionChat) return;
    const { chat, action } = actionChat;
    const isBlocked = action === "block";

    try {
      const res = await blockUnblock({
        id: chat._id,
        body: { isBlocked },
      }).unwrap();

      toast.success(
        res?.message ||
          `Chat channel has been ${action === "block" ? "blocked" : "unblocked"} successfully.`,
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, `Failed to ${action} chat channel.`));
    } finally {
      setActionChat(null);
    }
  }, [actionChat, blockUnblock]);

  const columns = useMemo<ColumnDef<ChatItem>[]>(
    () => [
      {
        key: "isGroup",
        title: "Channel / Participants",
        renderItem: (chat) => {
          const title = chat.isGroup
            ? chat.groupName || "Group Chat"
            : chat.participants.map((p) => p.fullName).join(" & ") ||
              "Direct Chat";
          const subtitle = chat.lastMessage?.text || "No recent messages";

          return (
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-teal-500/10 text-[#00ACA7] flex items-center justify-center font-bold text-sm shrink-0">
                {chat.isGroup ? "#" : <MessageSquare className="size-4" />}
              </div>
              <div className="max-w-xs overflow-hidden">
                <p className="font-semibold text-sm leading-tight text-foreground truncate">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "isGroup",
        title: "Type",
        renderItem: (chat) => (
          <Badge variant="outline" className="font-normal">
            {chat.isGroup ? "Group Chat" : "Direct Chat"}
          </Badge>
        ),
      },
      {
        key: "participants",
        title: "Participants",
        renderItem: (chat) => (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {chat.participants.slice(0, 3).map((p) => (
                <Avatar
                  key={p._id}
                  className="size-7 border-2 border-background shrink-0"
                >
                  <AvatarImage
                    src={p.profileImage || undefined}
                    alt={p.fullName}
                  />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {p.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="text-xs">
              <p className="font-medium text-foreground truncate max-w-[120px]">
                {chat.participants[0]?.fullName || "User"}
              </p>
              <p className="text-muted-foreground text-[10px]">
                {chat.participants.length} member
                {chat.participants.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "isBlocked",
        title: "Status",
        renderItem: (chat) => (
          <Badge
            className={getStatusColor(chat.isBlocked ? "BLOCKED" : "ACTIVE")}
          >
            {chat.isBlocked ? "Blocked" : "Active"}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        title: "Created Date",
        renderItem: (chat) => (
          <span className="text-xs text-muted-foreground text-nowrap">
            {chat.createdAt
              ? new Date(chat.createdAt).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        key: "_id",
        title: "Actions",
        align: "right",
        renderItem: (chat) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Inspect chat channel"
              title="Inspect Chat Channel"
              className="cursor-pointer"
              onClick={() => setSelectedChat(chat)}
            >
              <Eye className="size-4" />
            </Button>

            {chat.isBlocked ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Unblock chat channel"
                title="Unblock Channel"
                className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                onClick={() => setActionChat({ chat, action: "unblock" })}
              >
                <ShieldCheck className="size-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Block chat channel"
                title="Block Channel"
                className="text-red-600 hover:text-red-700 cursor-pointer"
                onClick={() => setActionChat({ chat, action: "block" })}
              >
                <ShieldOff className="size-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const filterButtons: {
    label: string;
    value: StatusFilter;
    icon: React.ReactNode;
  }[] = [
    {
      label: "All Channels",
      value: "All",
      icon: <MessageCircleMore className="w-4 h-4" />,
    },
    {
      label: "Active",
      value: "Active",
      icon: <UserCheck className="w-4 h-4" />,
    },
    { label: "Blocked", value: "Blocked", icon: <Ban className="w-4 h-4" /> },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125 p-6 text-center">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full mb-4 animate-bounce">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Failed to load chat channels
        </h3>
        <p className="text-muted-foreground max-w-md mb-4">
          We encountered an issue while connecting to the chat management
          servers.
        </p>
        <Button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-[#00ACA7] hover:bg-[#009691] text-white transition-colors cursor-pointer"
          disabled={isFetching}
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Chat Management & Supervision"
        description="Monitor active chat channels, direct messages, and participant safety."
      />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Chat Channels
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {stats?.totalRooms ?? meta?.total ?? 0}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-teal-500/10 text-[#00ACA7] flex items-center justify-center">
              <MessageSquare className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Active Channels
              </p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {(stats?.totalRooms ?? 0) - (stats?.blockedRooms ?? 0)}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Blocked Channels
              </p>
              <h3 className="text-2xl font-bold mt-1 text-red-600">
                {stats?.blockedRooms ?? 0}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <ShieldOff className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Group Channels
              </p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {stats?.totalGroups ?? 0}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Live Chat Channels
            </CardTitle>

            {/* Search Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search channel or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-2 pt-3 overflow-x-auto">
            {filterButtons.map((tab) => (
              <Button
                key={tab.value}
                variant={statusFilter === tab.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 rounded-full cursor-pointer transition-all ${
                  statusFilter === tab.value
                    ? "bg-[#00ACA7] text-white hover:bg-[#009691]"
                    : "hover:bg-muted"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <DataTable
            data={chats}
            loading={isLoading || isFetching}
            columns={columns}
            meta={
              meta
                ? {
                    page: meta.page,
                    limit: meta.limit,
                    total: meta.total,
                  }
                : undefined
            }
            onPageChange={(p) => setPage(p)}
            emptyText="No chat channels found."
          />
        </CardContent>
      </Card>

      {/* Inspect Dialog */}
      {selectedChat && (
        <Dialog
          open={!!selectedChat}
          onOpenChange={(o) => !o && setSelectedChat(null)}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {selectedChat.isGroup ? "Group Chat" : "Direct Chat"}
                    </Badge>
                    <Badge
                      className={getStatusColor(
                        selectedChat.isBlocked ? "BLOCKED" : "ACTIVE",
                      )}
                    >
                      {selectedChat.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl font-bold">
                    {selectedChat.isGroup
                      ? selectedChat.groupName || "Group Chat"
                      : selectedChat.participants
                          .map((p) => p.fullName)
                          .join(" & ")}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Participants */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Participants ({selectedChat.participants.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedChat.participants.map((participant) => (
                    <div
                      key={participant._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                    >
                      <Avatar className="size-10 border border-border shrink-0">
                        <AvatarImage
                          src={participant.profileImage || undefined}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {participant.fullName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {participant.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {participant.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Message Preview */}
              {selectedChat.lastMessage && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Recent Message Preview
                  </h4>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {selectedChat.lastMessage.sender?.fullName || "Sender"}
                      </span>
                      <span className="text-muted-foreground">
                        {selectedChat.lastMessage.createdAt
                          ? new Date(
                              selectedChat.lastMessage.createdAt,
                            ).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {selectedChat.lastMessage.text || "No text content"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Block / Unblock Confirmation Modal */}
      {actionChat && (
        <AlertDialog
          open={!!actionChat}
          onOpenChange={(o) => !o && setActionChat(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="capitalize">
                {actionChat.action} Chat Channel
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionChat.action} this chat channel?{" "}
                {actionChat.action === "block"
                  ? "Participants will no longer be able to send or receive messages in this channel."
                  : "Participants will be restored and allowed to communicate."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMutating}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBlockToggle}
                disabled={isMutating}
                className={
                  actionChat.action === "block"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-[#00ACA7] hover:bg-[#009691] text-white"
                }
              >
                {isMutating
                  ? "Processing..."
                  : actionChat.action === "block"
                    ? "Yes, Block Channel"
                    : "Yes, Unblock Channel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
