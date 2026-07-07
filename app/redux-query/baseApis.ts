import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const baseUrl = "https://v59d514q-8000.aue.devtunnels.ms/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: async (headers: any) => {
    const token = localStorage.getItem("accessToken");
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithServerCheck: any = async (args: any, api: any, extraOptions: any) => {
  try {
    // health check request
    const response = await fetch(baseUrl.replace("/api/v1", ""));

    if (!response.ok) {
      // router.replace("/server-down");
      return { error: { status: "SERVER_DOWN" } };
    }

  } catch (error) {
    // router.replace("/server-down");
    return { error: { status: "SERVER_DOWN" } };
  }

  return rawBaseQuery(args, api, extraOptions);
};

const baseApis = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithServerCheck,
  tagTypes: [
    "auth",
    "chatAssets",
    "event",
    "user"
  ],
  endpoints: () => ({}),
});

export default baseApis;