"use server";

import { cookies, headers } from "next/headers";

async function isSecureRequest() {
  const headerStore = await headers();
  const forwardedProtocol = headerStore
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();

  if (forwardedProtocol) {
    return forwardedProtocol === "https";
  }

  const requestUrl = headerStore.get("origin") || headerStore.get("referer");
  if (requestUrl) {
    try {
      return new URL(requestUrl).protocol === "https:";
    } catch {
      // Fall through to the safe production default for malformed headers.
    }
  }

  return process.env.NODE_ENV === "production";
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies();
  const secure = await isSecureRequest();

  cookieStore.set("accessToken", token, {
    httpOnly: false, // Accessible by both middleware and client JS if needed
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value || null;
}
