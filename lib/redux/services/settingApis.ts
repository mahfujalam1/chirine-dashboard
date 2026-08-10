import baseApis from "../baseApis";

const settingApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    callSettings: builder.query({
      query: () => ({
        url: "/settings/call",
        method: "GET",
      }),
      providesTags: ["setting"],
    }),
    updateCallSettings: builder.mutation({
      query: (data: {
        callType: "video" | "audio"
        status: boolean
      }) => ({
        url: "/settings/call",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["setting"],
    }),
  }),
});

export const {
  useCallSettingsQuery,
  useUpdateCallSettingsMutation
} = settingApis;
