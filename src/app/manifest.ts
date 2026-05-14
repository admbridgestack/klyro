import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klyro",
    short_name: "Klyro",
    description: "Tu negocio. Tus clientes. Tu marca.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A1F",
    theme_color: "#0A0A1F",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
