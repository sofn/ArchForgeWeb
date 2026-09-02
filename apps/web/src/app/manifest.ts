import type { MetadataRoute } from "next";

/**
 * Web app manifest (PWA): enables "Add to Home Screen" installs and a
 * standalone-app chrome on mobile. Icons are plain PNGs in public/icons
 * (indigo gradient, matching the OG renderer and the 404/brand palette).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArchForgeWeb",
    short_name: "ArchForge",
    description: "A C-end demo site powered by the ArchForge backend.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
