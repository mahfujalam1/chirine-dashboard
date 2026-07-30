import baseApis from '../baseApis';

const dashboardApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (params) => ({
        url: '/dashboard/overview',
        method: 'GET',
        params,
      }),
      providesTags: ['dashboard'],
      keepUnusedDataFor: 60,
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
} = dashboardApis

export default dashboardApis