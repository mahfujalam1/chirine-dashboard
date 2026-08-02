import baseApis from "../baseApis";

export type TicketStatus = "Pending" | "Replied" | "Closed";

export interface TicketUser {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
}

export interface SupportTicket {
  _id: string;
  user?: TicketUser | string;
  requesterName: string;
  requesterEmail: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  repliedAt?: string;
  repliedBy?: string;
  reply?: string;
}

export interface SupportTicketListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: TicketStatus;
}

export interface SupportTicketListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: SupportTicket[];
}

export interface SupportTicketSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SupportTicket;
}

export interface ReplyTicketParams {
  id: string;
  reply: string;
}

const customerSupportApis = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSupportTickets: builder.query<
      SupportTicketListResponse,
      SupportTicketListParams
    >({
      query: (params) => ({
        url: "/customer-support",
        method: "GET",
        params,
      }),
      providesTags: ["customerSupport"],
    }),

    getSupportTicketDetails: builder.query<
      SupportTicketSingleResponse,
      string
    >({
      query: (id) => ({
        url: `/customer-support/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "customerSupport", id },
        "customerSupport",
      ],
    }),

    replySupportTicket: builder.mutation<
      SupportTicketSingleResponse,
      ReplyTicketParams
    >({
      query: ({ id, reply }) => ({
        url: `/customer-support/${id}/reply`,
        method: "PATCH",
        body: { reply },
      }),
      async onQueryStarted({ id, reply }, { dispatch, getState, queryFulfilled }) {
        const cachedQueries = customerSupportApis.util.selectInvalidatedBy(
          getState(),
          ["customerSupport"]
        );
        const patches = cachedQueries
          .filter(({ endpointName }) => endpointName === "getSupportTickets")
          .map(({ originalArgs }) =>
            dispatch(
              customerSupportApis.util.updateQueryData(
                "getSupportTickets",
                originalArgs as SupportTicketListParams,
                (draft) => {
                  const ticket = draft.data.find((item) => item._id === id);
                  if (ticket) {
                    ticket.status = "Replied";
                    ticket.reply = reply;
                    ticket.repliedAt = new Date().toISOString();
                  }
                }
              )
            )
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ["customerSupport"],
    }),

    closeSupportTicket: builder.mutation<
      SupportTicketSingleResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/customer-support/${id}/close`,
        method: "PATCH",
      }),
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        const cachedQueries = customerSupportApis.util.selectInvalidatedBy(
          getState(),
          ["customerSupport"]
        );
        const patches = cachedQueries
          .filter(({ endpointName }) => endpointName === "getSupportTickets")
          .map(({ originalArgs }) =>
            dispatch(
              customerSupportApis.util.updateQueryData(
                "getSupportTickets",
                originalArgs as SupportTicketListParams,
                (draft) => {
                  const ticket = draft.data.find((item) => item._id === id);
                  if (ticket) {
                    ticket.status = "Closed";
                  }
                }
              )
            )
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ["customerSupport"],
    }),

    deleteSupportTicket: builder.mutation<
      SupportTicketSingleResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/customer-support/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        const cachedQueries = customerSupportApis.util.selectInvalidatedBy(
          getState(),
          ["customerSupport"]
        );
        const patches = cachedQueries
          .filter(({ endpointName }) => endpointName === "getSupportTickets")
          .map(({ originalArgs }) =>
            dispatch(
              customerSupportApis.util.updateQueryData(
                "getSupportTickets",
                originalArgs as SupportTicketListParams,
                (draft) => {
                  const index = draft.data.findIndex((item) => item._id === id);
                  if (index >= 0) {
                    draft.data.splice(index, 1);
                    if (draft.meta && draft.meta.total > 0) {
                      draft.meta.total--;
                    }
                  }
                }
              )
            )
          );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ["customerSupport"],
    }),
  }),
});

export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketDetailsQuery,
  useReplySupportTicketMutation,
  useCloseSupportTicketMutation,
  useDeleteSupportTicketMutation,
} = customerSupportApis;

export default customerSupportApis;
