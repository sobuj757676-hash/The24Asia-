import type { MetadataRoute } from "next";

/**
 * Web app manifest (PRD 13.1). App shortcuts for the core role journeys.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "24Asia — Migrant Empowerment",
    short_name: "24Asia",
    description:
      "Free training, community activities and support for migrant workers in Singapore.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#059669",
    orientation: "portrait",
    lang: "en",
    categories: ["education", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Learn", url: "/learn" },
      { name: "Events", url: "/events" },
      { name: "Volunteer", url: "/volunteer" },
      { name: "Get Support", url: "/support" },
    ],
  };
}
