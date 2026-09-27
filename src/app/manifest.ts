import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AlmaGo",
    short_name: "AlmaGo",
    description: "Un parcours vers les études, simplifié.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EC",
    theme_color: "#DB0423",
    icons: [
      {
        src: "/brand/almago-symbol.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
