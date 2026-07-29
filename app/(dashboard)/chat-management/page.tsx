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
import { Suspense, useMemo, useState } from "react";
import Loading from "./loading";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberStatus = "active" | "blocked";
type RoomType = "chat" | "group";

interface RoomMember {
  id: string;
  name: string;
  profile_image?: string;
  email: string;
  status: MemberStatus;
  isAdmin?: boolean; // only relevant in groups
  joinedAt: string;
}

interface ChatRoom {
  id: string;
  roomName: string;
  type: "chat";
  memberCount: number;
  members: RoomMember[];
  lastActivity: string;
  isBlocked: boolean; // room-level block
}

interface GroupRoom {
  id: string;
  roomName: string;
  type: "group";
  memberCount: number;
  members: RoomMember[];
  lastActivity: string;
  isBlocked: boolean;
  topic?: string;
}

type Room = ChatRoom | GroupRoom;

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_CHATS: ChatRoom[] = [
  {
    id: "c1",
    roomName: "Alice & Bob",
    type: "chat",
    memberCount: 2,
    isBlocked: false,
    lastActivity: "2025-10-20",
    members: [
      {
        id: "u1",
        name: "Alice Martin",
        email: "alice@example.com",
        status: "active",
        joinedAt: "2025-09-01",
      },
      {
        id: "u2",
        name: "Bob Chen",
        email: "bob@example.com",
        status: "active",
        joinedAt: "2025-09-01",
      },
    ],
  },
  {
    id: "c2",
    roomName: "Sara & James",
    type: "chat",
    memberCount: 2,
    isBlocked: true,
    lastActivity: "2025-10-15",
    members: [
      {
        id: "u3",
        name: "Sara Johnson",
        email: "sara@example.com",
        status: "blocked",
        joinedAt: "2025-09-10",
      },
      {
        id: "u4",
        name: "James Wilson",
        email: "james@example.com",
        status: "active",
        joinedAt: "2025-09-10",
      },
    ],
  },
  {
    id: "c3",
    roomName: "Noah & Emma",
    type: "chat",
    memberCount: 2,
    isBlocked: false,
    lastActivity: "2025-10-22",
    members: [
      {
        id: "u5",
        name: "Noah Kim",
        email: "noah@example.com",
        status: "active",
        joinedAt: "2025-09-15",
      },
      {
        id: "u6",
        name: "Emma Davis",
        email: "emma@example.com",
        status: "active",
        joinedAt: "2025-09-15",
      },
    ],
  },
  {
    id: "c4",
    roomName: "Liam & Olivia",
    type: "chat",
    memberCount: 2,
    isBlocked: false,
    lastActivity: "2025-10-18",
    members: [
      {
        id: "u7",
        name: "Liam Brooks",
        email: "liam@example.com",
        status: "active",
        joinedAt: "2025-09-20",
      },
      {
        id: "u8",
        name: "Olivia Wright",
        email: "olivia@example.com",
        status: "active",
        joinedAt: "2025-09-20",
      },
    ],
  },
];

const SEED_GROUPS: GroupRoom[] = [
  {
    id: "g1",
    roomName: "Anxiety Support Circle",
    type: "group",
    memberCount: 8,
    isBlocked: false,
    lastActivity: "2025-10-21",
    topic: "Managing anxiety in daily life",
    members: [
      {
        id: "u1",
        name: "Alice Martin",
        email: "alice@example.com",
        status: "active",
        isAdmin: true,
        joinedAt: "2025-08-01",
      },
      {
        id: "u9",
        name: "Mark Ellison",
        email: "mark@example.com",
        status: "active",
        joinedAt: "2025-08-05",
      },
      {
        id: "u10",
        name: "Priya Patel",
        email: "priya@example.com",
        status: "active",
        joinedAt: "2025-08-10",
      },
      {
        id: "u3",
        name: "Sara Johnson",
        email: "sara@example.com",
        status: "blocked",
        joinedAt: "2025-08-12",
      },
      {
        id: "u11",
        name: "Tom Baker",
        email: "tom@example.com",
        status: "active",
        joinedAt: "2025-08-15",
      },
      {
        id: "u12",
        name: "Lisa Nguyen",
        email: "lisa@example.com",
        status: "active",
        joinedAt: "2025-08-18",
      },
      {
        id: "u13",
        name: "Carlos Ruiz",
        email: "carlos@example.com",
        status: "active",
        joinedAt: "2025-08-20",
      },
      {
        id: "u14",
        name: "Mia Thompson",
        email: "mia@example.com",
        status: "active",
        joinedAt: "2025-08-22",
      },
    ],
  },
  {
    id: "g2",
    roomName: "Mindfulness & Wellness",
    type: "group",
    memberCount: 5,
    isBlocked: false,
    lastActivity: "2025-10-19",
    topic: "Daily mindfulness practices",
    members: [
      {
        id: "u2",
        name: "Bob Chen",
        email: "bob@example.com",
        status: "active",
        isAdmin: true,
        joinedAt: "2025-08-01",
      },
      {
        id: "u5",
        name: "Noah Kim",
        email: "noah@example.com",
        status: "active",
        joinedAt: "2025-08-08",
      },
      {
        id: "u6",
        name: "Emma Davis",
        email: "emma@example.com",
        status: "active",
        joinedAt: "2025-08-10",
      },
      {
        id: "u15",
        name: "Sofia Torres",
        email: "sofia@example.com",
        status: "active",
        joinedAt: "2025-08-14",
      },
      {
        id: "u16",
        name: "Ethan Clark",
        email: "ethan@example.com",
        status: "blocked",
        joinedAt: "2025-08-18",
      },
    ],
  },
  {
    id: "g3",
    roomName: "Grief & Loss Support",
    type: "group",
    memberCount: 6,
    isBlocked: true,
    lastActivity: "2025-10-10",
    topic: "Coping with loss",
    members: [
      {
        id: "u4",
        name: "James Wilson",
        email: "james@example.com",
        status: "active",
        isAdmin: true,
        joinedAt: "2025-07-01",
      },
      {
        id: "u7",
        name: "Liam Brooks",
        email: "liam@example.com",
        status: "active",
        joinedAt: "2025-07-05",
      },
      {
        id: "u8",
        name: "Olivia Wright",
        email: "olivia@example.com",
        status: "active",
        joinedAt: "2025-07-08",
      },
      {
        id: "u11",
        name: "Tom Baker",
        email: "tom@example.com",
        status: "active",
        joinedAt: "2025-07-10",
      },
      {
        id: "u17",
        name: "Hannah Scott",
        email: "hannah@example.com",
        status: "active",
        joinedAt: "2025-07-12",
      },
      {
        id: "u18",
        name: "Ryan Foster",
        email: "ryan@example.com",
        status: "blocked",
        joinedAt: "2025-07-15",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function MemberAvatar({
  member,
  size = "sm",
}: {
  member: RoomMember;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const txt = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <Avatar className={`${sz} shrink-0`}>
      <AvatarImage src={member.profile_image} />
      <AvatarFallback className={`${txt} font-medium`}>
        {initials(member.name)}
      </AvatarFallback>
    </Avatar>
  );
}

// ─── Member Row in detail dialog ──────────────────────────────────────────────

interface MemberRowProps {
  member: RoomMember;
  onToggleBlock: (memberId: string) => void;
}

function MemberRow({ member, onToggleBlock }: MemberRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="relative">
        <MemberAvatar member={member} size="md" />
        {member.isAdmin && (
          <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
            <Crown className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground truncate">
            {member.name}
          </p>
          {member.isAdmin && (
            <span className="text-[10px] text-amber-600 font-medium">
              Admin
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={
            member.status === "active"
              ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
          }
        >
          {member.status}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${
            member.status === "active"
              ? "text-destructive hover:text-destructive hover:bg-destructive/10"
              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          }`}
          title={member.status === "active" ? "Block member" : "Unblock member"}
          onClick={() => onToggleBlock(member.id)}
        >
          {member.status === "active" ? (
            <ShieldOff className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Room Detail Dialog ───────────────────────────────────────────────────────

interface RoomDetailProps {
  room: Room | null;
  onClose: () => void;
  onToggleMemberBlock: (roomId: string, memberId: string) => void;
  onToggleRoomBlock: (roomId: string) => void;
}

function RoomDetailDialog({
  room,
  onClose,
  onToggleMemberBlock,
  onToggleRoomBlock,
}: RoomDetailProps) {
  const [confirmBlock, setConfirmBlock] = useState<{
    memberId: string;
    action: "block" | "unblock";
  } | null>(null);

  if (!room) return null;

  const blockedCount = room.members.filter(
    (m) => m.status === "blocked",
  ).length;

  return (
    <>
      <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <div
                className={`p-2 rounded shrink-0 mt-0.5 ${room.type === "group" ? "bg-blue-50 dark:bg-blue-950/40" : "bg-muted"}`}
              >
                {room.type === "group" ? (
                  <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <MessageCircleMore className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base leading-tight truncate">
                  {room.roomName}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs capitalize">
                    {room.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      room.isBlocked
                        ? "text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                        : "text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                    }
                  >
                    {room.isBlocked ? "Room Blocked" : "Room Active"}
                  </Badge>
                  {blockedCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                    >
                      {blockedCount} blocked
                    </Badge>
                  )}
                </div>
                {"topic" in room && room.topic && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {room.topic}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Members ({room.members.length})
              </p>
            </div>
            <div>
              {room.members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onToggleBlock={(memberId) =>
                    setConfirmBlock({
                      memberId,
                      action: member.status === "active" ? "block" : "unblock",
                    })
                  }
                />
              ))}
            </div>
          </div>

          {/* Room-level block */}
          <div className="pt-3 border-t border-border mt-2">
            <Button
              variant="outline"
              size="sm"
              className={`w-full ${
                room.isBlocked
                  ? "text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  : "text-destructive border-destructive/40 hover:bg-destructive/10"
              }`}
              onClick={() => onToggleRoomBlock(room.id)}
            >
              {room.isBlocked ? (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Unblock Entire Room
                </>
              ) : (
                <>
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Block Entire Room
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member block/unblock confirm */}
      <AlertDialog
        open={!!confirmBlock}
        onOpenChange={(o) => !o && setConfirmBlock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBlock?.action === "block"
                ? "Block this member?"
                : "Unblock this member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBlock?.action === "block"
                ? "This member will no longer be able to send or receive messages in this room."
                : "This member will regain the ability to send and receive messages in this room."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmBlock(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmBlock?.action === "block"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }
              onClick={() => {
                if (confirmBlock) {
                  onToggleMemberBlock(room.id, confirmBlock.memberId);
                  setConfirmBlock(null);
                }
              }}
            >
              {confirmBlock?.action === "block"
                ? "Block Member"
                : "Unblock Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatManagementPage() {
  const [chats, setChats] = useState<ChatRoom[]>(SEED_CHATS);
  const [groups, setGroups] = useState<GroupRoom[]>(SEED_GROUPS);
  const [tab, setTab] = useState<"chat" | "groups">("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "blocked"
  >("all");
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);

  // ── Counts ──
  const counts = useMemo(
    () => ({
      rooms: chats.length,
      groups: groups.length,
      blockedRooms: [...chats, ...groups].filter((r) => r.isBlocked).length,
    }),
    [chats, groups],
  );

  // ── Filtered data ──
  const activeData = tab === "chat" ? chats : groups;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activeData.filter((room) => {
      if (statusFilter === "active" && room.isBlocked) return false;
      if (statusFilter === "blocked" && !room.isBlocked) return false;
      if (q) {
        const matchName = room.roomName.toLowerCase().includes(q);
        const matchMember = room.members.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q),
        );
        if (!matchName && !matchMember) return false;
      }
      return true;
    });
  }, [activeData, searchQuery, statusFilter]);

  // ── Handlers ──
  function toggleRoomBlock(roomId: string) {
    const update = (rooms: Room[]) =>
      rooms.map((r) =>
        r.id === roomId ? { ...r, isBlocked: !r.isBlocked } : r,
      );

    if (tab === "chat") setChats((prev) => update(prev) as ChatRoom[]);
    else setGroups((prev) => update(prev) as GroupRoom[]);

    setDetailRoom((prev) =>
      prev?.id === roomId ? { ...prev, isBlocked: !prev.isBlocked } : prev,
    );
  }

  function toggleMemberBlock(roomId: string, memberId: string) {
    const updateMembers = (rooms: Room[]) =>
      rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              members: r.members.map((m) =>
                m.id === memberId
                  ? {
                      ...m,
                      status: m.status === "active" ? "blocked" : "active",
                    }
                  : m,
              ),
            }
          : r,
      );

    if (tab === "chat") setChats((prev) => updateMembers(prev) as ChatRoom[]);
    else setGroups((prev) => updateMembers(prev) as GroupRoom[]);

    setDetailRoom((prev) =>
      prev?.id === roomId
        ? {
            ...prev,
            members: prev.members.map((m) =>
              m.id === memberId
                ? { ...m, status: m.status === "active" ? "blocked" : "active" }
                : m,
            ),
          }
        : prev,
    );
  }

  // ── Columns ──
  const chatColumns: ColumnDef<ChatRoom>[] = [
    {
      title: "Room",
      key: "roomName",
      renderItem: (record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-muted shrink-0">
            <MessageCircleMore className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {record.roomName}
            </p>
            <p className="text-xs text-muted-foreground">
              {record.memberCount} members
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Members",
      renderItem: (record) => (
        <div className="flex items-center -space-x-2">
          {record.members.slice(0, 4).map((m) => (
            <MemberAvatar key={m.id} member={m} />
          ))}
          {record.members.length > 4 && (
            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground font-medium">
                +{record.members.length - 4}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Last Activity",
      key: "lastActivity",
      renderItem: (record) => (
        <span className="text-sm text-muted-foreground">
          {record.lastActivity}
        </span>
      ),
    },
    {
      title: "Status",
      key: "isBlocked",
      renderItem: (record) => (
        <Badge
          variant="outline"
          className={
            record.isBlocked
              ? "text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
              : "text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
          }
        >
          {record.isBlocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (record) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="View room"
            onClick={(e) => {
              e.stopPropagation();
              setDetailRoom(record);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${
              record.isBlocked
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "text-destructive hover:text-destructive hover:bg-destructive/10"
            }`}
            title={record.isBlocked ? "Unblock room" : "Block room"}
            onClick={(e) => {
              e.stopPropagation();
              toggleRoomBlock(record.id);
            }}
          >
            {record.isBlocked ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  const groupColumns: ColumnDef<GroupRoom>[] = [
    {
      title: "Group",
      key: "roomName",
      renderItem: (record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 shrink-0">
            <Boxes className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {record.roomName}
            </p>
            {record.topic && (
              <p className="text-xs text-muted-foreground truncate max-w-50">
                {record.topic}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Members",
      renderItem: (record) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {record.members.slice(0, 4).map((m) => (
              <MemberAvatar key={m.id} member={m} />
            ))}
            {record.members.length > 4 && (
              <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{record.members.length - 4}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {record.memberCount}
          </span>
        </div>
      ),
    },
    {
      title: "Blocked",
      renderItem: (record) => {
        const blocked = record.members.filter(
          (m) => m.status === "blocked",
        ).length;
        return blocked > 0 ? (
          <Badge
            variant="outline"
            className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
          >
            {blocked} blocked
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      title: "Last Activity",
      key: "lastActivity",
      renderItem: (record) => (
        <span className="text-sm text-muted-foreground">
          {record.lastActivity}
        </span>
      ),
    },
    {
      title: "Status",
      key: "isBlocked",
      renderItem: (record) => (
        <Badge
          variant="outline"
          className={
            record.isBlocked
              ? "text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
              : "text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
          }
        >
          {record.isBlocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (record) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="View group"
            onClick={(e) => {
              e.stopPropagation();
              setDetailRoom(record);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${
              record.isBlocked
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "text-destructive hover:text-destructive hover:bg-destructive/10"
            }`}
            title={record.isBlocked ? "Unblock group" : "Block group"}
            onClick={(e) => {
              e.stopPropagation();
              toggleRoomBlock(record.id);
            }}
          >
            {record.isBlocked ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <>
        <PageHeader
          title="Chat Management"
          description="Monitor rooms, manage members, and control access."
        />

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 mb-1">
          <Card
            className={`bg-card border border-border cursor-pointer hover:border-foreground/30 transition-all ${tab === "chat" ? "ring-foreground/20" : ""}`}
            onClick={() => setTab("chat")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Total Rooms
                </span>
                <div className="p-2 bg-muted rounded">
                  <MessageCircleMore className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">{counts.rooms}</p>
              <p className="text-xs text-muted-foreground mt-1">1-to-1 chats</p>
            </CardContent>
          </Card>
          <Card
            className={`bg-card border border-border cursor-pointer hover:border-foreground/30 transition-all ${tab === "groups" ? "ring-foreground/20" : ""}`}
            onClick={() => setTab("groups")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Total Groups
                </span>
                <div className="p-2 bg-muted rounded">
                  <Boxes className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">{counts.groups}</p>
              <p className="text-xs text-muted-foreground mt-1">
                multi-member groups
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Blocked Rooms
                </span>
                <div className="p-2 bg-muted rounded">
                  <ShieldOff className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-semibold">{counts.blockedRooms}</p>
              <p className="text-xs text-muted-foreground mt-1">
                across all rooms
              </p>
            </CardContent>
          </Card>
          <ActiveTherapist />
        </div>

        {/* ── Table ── */}
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <CardTitle className="text-base font-medium">
                {tab === "chat" ? "Chat Rooms" : "Group Rooms"}
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={
                    tab === "chat"
                      ? "Search rooms or members…"
                      : "Search groups or members…"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tab + status filters */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                {(["chat", "groups"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={tab === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTab(t);
                      setStatusFilter("all");
                    }}
                    className={`capitalize ${tab === t ? "bg-foreground text-background" : "bg-transparent"}`}
                  >
                    {t === "chat" ? (
                      <>
                        <MessageCircleMore className="w-3.5 h-3.5 mr-1.5" />
                        Chats
                      </>
                    ) : (
                      <>
                        <Boxes className="w-3.5 h-3.5 mr-1.5" />
                        Groups
                      </>
                    )}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {(["all", "active", "blocked"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className={`capitalize text-xs ${statusFilter === s ? "bg-foreground text-background" : "bg-transparent"}`}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {tab === "chat" ? (
              <DataTable
                data={filtered as ChatRoom[]}
                columns={chatColumns}
                rowKey={(r) => r.id}
                onRowClick={(record) => setDetailRoom(record)}
                emptyText="No chat rooms match the current filters."
                meta={{ total: filtered.length, limit: 8, page: 1 }}
              />
            ) : (
              <DataTable
                data={filtered as GroupRoom[]}
                columns={groupColumns}
                rowKey={(r) => r.id}
                onRowClick={(record) => setDetailRoom(record)}
                emptyText="No groups match the current filters."
                meta={{ total: filtered.length, limit: 8, page: 1 }}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Room Detail Dialog ── */}
        <RoomDetailDialog
          room={detailRoom}
          onClose={() => setDetailRoom(null)}
          onToggleMemberBlock={toggleMemberBlock}
          onToggleRoomBlock={toggleRoomBlock}
        />
      </>
    </Suspense>
  );
}
