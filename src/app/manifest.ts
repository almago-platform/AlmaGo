import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Campus Allemagne",
    short_name: "Campus Allemagne",
    description: "Un parcours vers les études, simplifié.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EC",
    theme_color: "#DB0423",
    icons: [
      {
        src: "/brand/campus-allemagne-symbol-approved.png",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
