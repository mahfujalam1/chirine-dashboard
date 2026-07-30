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

export const mockChatRooms: ChatRoom[] = [
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
