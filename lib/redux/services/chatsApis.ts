import baseApis from "../baseApis";

export interface ChatParticipant {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  profession?: string | null;
}

export interface ChatLastMessage {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    fullName: string;
  };
  receiver: string;
  text?: string | null;
  file?: string | null;
  asset?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChatItem {
  _id: string;
  isBlocked: boolean;
  isGroup: boolean;
  groupName?: string | null;
  participants: ChatParticipant[];
  lastMessage?: ChatLastMessage | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChatsListParams {
  status?: "All" | "Active" | "Blocked" | string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface ChatsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    stats: {
      totalRooms: number;
      totalGroups: number;
      blockedRooms: number;
    };
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
    result: ChatItem[];
  };
}

const chatApi = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getChatsList: builder.query<ChatsListResponse, ChatsListParams | void>({
      query: (params) => ({
        url: `/dashboard/chats`,
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["chat"],
    }),
    blockUnblock: builder.mutation<
      { success: boolean; message?: string },
      { id: string; body: { isBlocked: boolean } }
    >({
      query: ({ id, body }) => ({
        url: `/dashboard/chats/${id}/block`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["chat", "dashboard"],
    }),
  }),
});

export const { useGetChatsListQuery, useBlockUnblockMutation } = chatApi;
export default chatApi;
