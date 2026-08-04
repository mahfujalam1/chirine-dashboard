import baseApis from "../baseApis";

const userApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getAllTherapists: builder.query({
      query: (params: any) => ({
        url: "/dashboard/therapists",
        method: "GET",
        params,
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
    verifyTherapist: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/dashboard/therapists/${id}/verify`,
        method: "POST",
      }),
      invalidatesTags: ["user"],
    }),
    blockTherapist: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/dashboard/therapists/${id}/block`,
        method: "PATCH",
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useGetAllTherapistsQuery,
  useGetSingleUserQuery,
  useVerifyTherapistMutation,
  useBlockTherapistMutation,
} = userApis;
