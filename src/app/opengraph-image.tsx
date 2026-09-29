import { ImageResponse } from "next/og";
import { BRAND_NAME } from "@/lib/brand";

export const alt = "Campus Allemagne — études en Allemagne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F4EC",
          padding: "72px 78px 58px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#1C2124", letterSpacing: -1 }}>
            {BRAND_NAME}
          </div>
          <div style={{ marginTop: 56, fontSize: 72, lineHeight: 1.06, fontWeight: 800, color: "#1C2124", maxWidth: 880 }}>
            Étudier en Allemagne,
            <span style={{ color: "#DB0423" }}> étape par étape.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#555B5E", maxWidth: 830 }}>
            Programmes, documents, candidatures et préparation dans un parcours clair.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 330, height: 18, background: "#1C2124", borderRadius: 99 }} />
          <div style={{ width: 250, height: 18, background: "#DB0423", borderRadius: 99 }} />
          <div style={{ width: 170, height: 18, background: "#FCB50A", borderRadius: 99 }} />
        </div>
      </div>
    ),
    size,
  );
}
