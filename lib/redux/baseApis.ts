import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://15.157.222.174:8000/api/v1";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token =
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null) || getCookie("accessToken");
    // console.log(token);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseApis = createApi({
  reducerPath: "api",
  baseQuery,
  keepUnusedDataFor: 300, // Retain unused cache data for 5 minutes
  refetchOnMountOrArgChange: 30, // Background re-verify if data is older than 30s upon re-mounting
  refetchOnReconnect: true, // Refetch when network connection is restored
  refetchOnFocus: true, // Refetch when window regains focus
  tagTypes: [
    "auth",
    "chatAssets",
    "event",
    "user",
    "report",
    "profile",
    "profession",
    "governingBody",
    "dashboard",
    "chat",
    "customerSupport",
    "setting",
    "expertise",
    "manageWeb"
  ],
  endpoints: () => ({}),
});

export default baseApis;
