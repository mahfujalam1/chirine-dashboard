import baseApis from "../baseApis";

export type CallType = "audio" | "video";

export interface CallSettings {
  audio: boolean;
  video: boolean;
}

export interface CallSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CallSettings;
}

export interface UpdateCallSettingsPayload {
  callType: CallType;
  status: boolean;
}

export interface UpdateCallSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: CallSettings;
}

const settingApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    callSettings: builder.query<CallSettingsResponse, void>({
      query: () => ({
        url: "/settings/call",
        method: "GET",
      }),
      providesTags: ["setting"],
    }),

    updateCallSettings: builder.mutation<
      UpdateCallSettingsResponse,
      UpdateCallSettingsPayload
    >({
      query: (data) => ({
        url: "/settings/call",
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ callType, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          settingApis.util.updateQueryData("callSettings", undefined, (draft) => {
            draft.data[callType] = status;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["setting"],
    }),
  }),
});

export const { useCallSettingsQuery, useUpdateCallSettingsMutation } =
  settingApis;

export default settingApis;
