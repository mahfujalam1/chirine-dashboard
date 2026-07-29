import baseApis from '../baseApis';

const userApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getAllTherapists: builder.query({
      query: (params: any) => ({
        url: "/dashboard/therapists",
        method: "GET",
        params
      }),
      providesTags: ["user"],
    }),
    getSingleUser: builder.query({
      query: (id: string) => ({
        url: `/user/get-single-user/${id}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),
  }),
});

export const { useGetAllTherapistsQuery, useGetSingleUserQuery } = userApis;