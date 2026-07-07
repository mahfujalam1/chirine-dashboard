import baseApis from '../baseApis';

const chatAssetsApi = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getChatAssets: builder.query({
      query: (params) => ({
        url: `/chat-assets/all`,
        method: 'GET',
        params,
      }),
      providesTags: ["chatAssets"],
    }),
    deleteAssets: builder.mutation({
      query: (id) => ({
        url: `/chat-assets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["chatAssets"],
    }),
    createAssets: builder.mutation({
      query: (body) => ({
        url: `/chat-assets/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ["chatAssets"],
    })
  }),
})

export const { useGetChatAssetsQuery, useDeleteAssetsMutation, useCreateAssetsMutation } = chatAssetsApi
