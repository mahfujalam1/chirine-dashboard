"use client";

import { ActiveTherapist } from "@/components/dashboard/active-therapist";
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
  Boxes,
  Crown,
  Eye,
  Hash,
  MessageCircleMore,
  Search,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";

// Types
export interface ChatRoomUser {
  id: string;
  name: string;
  role: "Therapist" | "Peer Support" | "Member" | "Moderator";
  avatar?: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "system";
  mediaUrl?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  category: "Peer Support" | "Group Therapy" | "Topic Discussion" | "1-on-[#00ACA7]";
  description: string;
  status: "Active" | "Paused" | "Archived";
  host: ChatRoomUser;
  participantsCount: number;
  maxParticipants: number;
  messageCount: number;
  lastActivity: string;
  createdAt: string;
  tags: string[];
  isPrivate: boolean;
  members: ChatRoomUser[];
  recentMessages: ChatMessage[];
}

const mockChatRooms: ChatRoom[] = [
  {
    id: "room-1",
    name: "Anxiety & Stress Management",
    category: "Peer Support",
    description:
      "A safe space to share coping strategies, daily challenges, and ground exercises for anxiety management.",
    status: "Active",
    host: {
      id: "user-101",
      name: "Dr. Sarah Jenkins",
      role: "Therapist",
      avatar: "/professional-man-avatar.png",
      isOnline: true,
    },
    participantsCount: 14,
    maxParticipants: 20,
    messageCount: 342,
    lastActivity: "2 mins ago",
    createdAt: "2026-01-10",
    tags: ["Anxiety", "Mindfulness", "CBT"],
    isPrivate: false,
    members: [
      {
        id: "user-101",
        name: "Dr. Sarah Jenkins",
        role: "Therapist",
        avatar: "/professional-man-avatar.png",
        isOnline: true,
      },
      {
        id: "user-102",
        name: "Alex Rivera",
        role: "Peer Support",
        isOnline: true,
      },
      { id: "user-103", name: "Jordan Lee", role: "Member", isOnline: false },
      { id: "user-104", name: "Morgan Smith", role: "Member", isOnline: true },
      { id: "user-105", name: "Taylor Swift", role: "Member", isOnline: false },
    ],
    recentMessages: [
      {
        id: "m-1",
        senderId: "user-101",
        senderName: "Dr. Sarah Jenkins",
        senderRole: "Therapist",
        content:
          "Welcome everyone! Today we're focusing on 4-7-8 breathing techniques.",
        timestamp: "10:15 AM",
        type: "text",
      },
      {
        id: "m-2",
        senderId: "user-102",
        senderName: "Alex Rivera",
        senderRole: "Peer Support",
        content: "That technique really helped me during work meetings last week.",
        timestamp: "10:17 AM",
        type: "text",
      },
      {
        id: "m-3",
        senderId: "user-104",
        senderName: "Morgan Smith",
        senderRole: "Member",
        content: "Can someone remind me of the second step?",
        timestamp: "10:20 AM",
        type: "text",
      },
    ],
  },
  {
    id: "room-2",
    name: "Depression Recovery Circle",
    category: "Group Therapy",
    description:
      "Guided support group focused on cognitive restructuring and incremental daily achievement tracking.",
    status: "Active",
    host: {
      id: "user-201",
      name: "Michael Chen, LMFT",
      role: "Therapist",
      isOnline: true,
    },
    participantsCount: 8,
    maxParticipants: 12,
    messageCount: 189,
    lastActivity: "15 mins ago",
    createdAt: "2026-01-15",
    tags: ["Depression", "Recovery", "Group Session"],
    isPrivate: true,
    members: [
      {
        id: "user-201",
        name: "Michael Chen, LMFT",
        role: "Therapist",
        isOnline: true,
      },
      { id: "user-202", name: "Sam Wilson", role: "Member", isOnline: true },
      { id: "user-203", name: "Chris Evans", role: "Member", isOnline: false },
    ],
    recentMessages: [
      {
        id: "m-201",
        senderId: "user-201",
        senderName: "Michael Chen, LMFT",
        senderRole: "Therapist",
        content:
          "Remember that small wins count just as much. What's one positive thing from today?",
        timestamp: "09:45 AM",
        type: "text",
      },
    ],
  },
  {
    id: "room-3",
    name: "Youth Mental Health & School Stress",
    category: "Topic Discussion",
    description:
      "Open discussion for young adults managing academic pressure and social expectations.",
    status: "Paused",
    host: {
      id: "user-301",
      name: "Elena Rostova",
      role: "Moderator",
      isOnline: false,
    },
    participantsCount: 22,
    maxParticipants: 30,
    messageCount: 512,
    lastActivity: "1 hour ago",
    createdAt: "2025-11-20",
    tags: ["Youth", "Academic", "Peer Help"],
    isPrivate: false,
    members: [
      {
        id: "user-301",
        name: "Elena Rostova",
        role: "Moderator",
        isOnline: false,
      },
      { id: "user-302", name: "David K.", role: "Member", isOnline: true },
    ],
    recentMessages: [
      {
        id: "m-301",
        senderId: "user-301",
        senderName: "Elena Rostova",
        senderRole: "Moderator",
        content:
          "Room paused for scheduled moderation review. Will re-open at 2 PM.",
        timestamp: "08:30 AM",
        type: "system",
      },
    ],
  },
];

export default function ChatManagementClientView() {
  const [rooms, setRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [actionRoom, setActionRoom] = useState<{
    room: ChatRoom;
    action: "pause" | "activate" | "archive";
  } | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (categoryFilter !== "All" && room.category !== categoryFilter)
        return false;
      if (statusFilter !== "All" && room.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = room.name.toLowerCase().includes(q);
        const matchHost = room.host.name.toLowerCase().includes(q);
        const matchTags = room.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchHost && !matchTags) return false;
      }
      return true;
    });
  }, [rooms, categoryFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const active = rooms.filter((r) => r.status === "Active").length;
    const paused = rooms.filter((r) => r.status === "Paused").length;
    const totalParticipants = rooms.reduce(
      (acc, curr) => acc + curr.participantsCount,
      0
    );
    return { total, active, paused, totalParticipants };
  }, [rooms]);

  const handleStatusChange = () => {
    if (!actionRoom) return;
    const { room, action } = actionRoom;
    const nextStatus =
      action === "pause" ? "Paused" : action === "activate" ? "Active" : "Archived";

    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, status: nextStatus } : r))
    );
    setActionRoom(null);
  };

  const getStatusBadge = useCallback((status: ChatRoom["status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20">Active</Badge>;
      case "Paused":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/20">Paused</Badge>;
      case "Archived":
        return <Badge variant="secondary">Archived</Badge>;
    }
  }, []);

  const columns: ColumnDef<ChatRoom>[] = useMemo(
    () => [
      {
        key: "name",
        title: "Chat Room",
        renderItem: (room) => (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-teal-500/10 text-[#00ACA7] flex items-center justify-center font-bold text-sm shrink-0">
              #
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight text-foreground">{room.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{room.description}</p>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        title: "Category",
        renderItem: (room) => <Badge variant="outline" className="font-normal">{room.category}</Badge>,
      },
      {
        key: "host",
        title: "Host / Moderator",
        renderItem: (room) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarImage src={room.host.avatar} />
              <AvatarFallback className="text-xs">{room.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-medium">{room.host.name}</p>
              <p className="text-muted-foreground text-[10px]">{room.host.role}</p>
            </div>
          </div>
        ),
      },
      {
        key: "participantsCount",
        title: "Members",
        renderItem: (room) => (
          <span className="text-xs font-medium">
            {room.participantsCount} / {room.maxParticipants}
          </span>
        ),
      },
      {
        key: "status",
        title: "Status",
        renderItem: (room) => getStatusBadge(room.status),
      },
      {
        key: "id",
        title: "Actions",
        align: "right",
        renderItem: (room) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              title="Inspect Chat Room"
              onClick={() => setSelectedRoom(room)}
            >
              <Eye className="size-4" />
            </Button>

            {room.status === "Active" ? (
              <Button
                size="icon"
                variant="ghost"
                title="Pause Room"
                className="text-amber-600 hover:text-amber-700"
                onClick={() => setActionRoom({ room, action: "pause" })}
              >
                <ShieldOff className="size-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                title="Activate Room"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => setActionRoom({ room, action: "activate" })}
              >
                <ShieldCheck className="size-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [getStatusBadge]
  );

  return (
    <>
      <PageHeader
        title="Chat Management & Supervision"
        description="Monitor peer support chat channels, inspect activity logs, and moderate active discussions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Chat Channels</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="size-10 rounded-xl bg-teal-500/10 text-[#00ACA7] flex items-center justify-center">
              <Boxes className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Channels</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{stats.active}</h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Paused Channels</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">{stats.paused}</h3>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldOff className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Participants</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalParticipants}</h3>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <MessageCircleMore className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold">Live Chat Rooms</CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search channels or hosts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-9 bg-muted border border-border text-xs rounded-md px-2 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredRooms}
                columns={columns}
                rowKey={(r) => r.id}
                emptyText="No chat rooms found matching your query."
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <ActiveTherapist />
        </div>
      </div>

      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={(o) => !o && setSelectedRoom(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{selectedRoom.category}</Badge>
                    {getStatusBadge(selectedRoom.status)}
                  </div>
                  <DialogTitle className="text-xl font-bold">{selectedRoom.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">{selectedRoom.description}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Channel Host & Details
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={selectedRoom.host.avatar} />
                      <AvatarFallback>{selectedRoom.host.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold">{selectedRoom.host.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedRoom.host.role}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground">
                      Capacity: <span className="font-semibold text-foreground">{selectedRoom.participantsCount} / {selectedRoom.maxParticipants}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Created: <span className="font-semibold text-foreground">{selectedRoom.createdAt}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Recent Messages Log ({selectedRoom.recentMessages.length})
                </h4>
                <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border max-h-60 overflow-y-auto">
                  {selectedRoom.recentMessages.map((msg) => (
                    <div key={msg.id} className="text-xs space-y-1 border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          {msg.senderName}
                          <Badge variant="secondary" className="text-[9px] py-0 px-1 font-normal">
                            {msg.senderRole}
                          </Badge>
                        </span>
                        <span className="text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {actionRoom && (
        <AlertDialog open={!!actionRoom} onOpenChange={(o) => !o && setActionRoom(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="capitalize">
                {actionRoom.action} Chat Room?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionRoom.action} channel &quot;{actionRoom.room.name}&quot;? Members will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusChange}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
