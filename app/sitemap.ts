import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mindshift-admin.vercel.app";

  const routes = [
    "",
    "/login",
    "/forgot-password",
    "/otp-verification",
    "/reset-password",
    "/chat-assets",
    "/chat-management",
    "/events",
    "/events-requests",
    "/governing-bodies",
    "/professions",
    "/profile",
    "/reports",
    "/therapists",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
