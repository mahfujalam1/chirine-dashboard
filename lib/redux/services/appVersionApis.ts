import baseApis from "../baseApis";

export type AppPlatform = "android" | "ios";
export type AppVersionStatus = "draft" | "published" | "disabled";

export interface AppVersionSetting {
  platform: AppPlatform;
  latestVersion: string;
  minimumVersion: string;
  latestBuildNumber: number;
  minimumBuildNumber: number;
  forceUpdate: boolean;
  updateAvailable: boolean;
  title: string;
  message: string;
  updateButtonText: string;
  laterButtonText: string | null;
  storeUrl: string;
  releaseNotes: string;
  status: AppVersionStatus;
}

export interface GetAppVersionsResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: {
    appVersions: AppVersionSetting[];
  };
}

export interface SaveAppVersionsPayload {
  appVersions: AppVersionSetting[];
}

export type SaveAppVersionsResponse = GetAppVersionsResponse;

const appVersionApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getAppVersions: builder.query<GetAppVersionsResponse, void>({
      query: () => ({
        url: "/app-version",
        method: "GET",
      }),
      providesTags: ["appVersion"],
    }),

    saveAppVersions: builder.mutation<
      SaveAppVersionsResponse,
      SaveAppVersionsPayload
    >({
      query: (body) => ({
        url: "/app-version",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["appVersion"],
    }),
  }),
});

export const { useGetAppVersionsQuery, useSaveAppVersionsMutation } =
  appVersionApis;

export default appVersionApis;
