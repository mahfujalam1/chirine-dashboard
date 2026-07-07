import baseApis from '../baseApis';

const eventApis = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllRequestEvents: builder.query({
      query: (params) => ({
        url: `/event/request`,
        method: 'GET',
        params,
      }),
      providesTags: ["event"],
    }),
  }),
})

export const { useGetAllRequestEventsQuery } = eventApis
