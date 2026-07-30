import baseApis from "../baseApis";

const chatApi = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getChatsList: builder.query({
      query: (params) => ({
        url: `/dashboard/chats`,
        method: "GET",
        params,
      }),
    }),
    blockUnblock: builder.mutation({
      query: ({ id, body }) => ({
        url: `/dashboard/chats/${id}/block`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const { useGetChatsListQuery, useBlockUnblockMutation } = chatApi;
