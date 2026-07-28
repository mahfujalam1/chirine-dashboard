import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const baseUrl = "https://v59d514q-8000.aue.devtunnels.ms/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseApis = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "auth",
    "chatAssets",
    "event",
    "user",
    "report",
    "profile",
    "profession",
    "governingBody"
  ],
  endpoints: () => ({}),
});

export default baseApis;
