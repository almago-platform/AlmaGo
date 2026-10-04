export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const token = process.env.MAINTENANCE_DELETE_TOKEN;
  if (!token) return;

  const baseUrl = process.env.RENDER_EXTERNAL_URL || "https://almago-dev.onrender.com";
  const url = new URL("/api/internal/maintenance/delete-target-document", baseUrl);
  url.searchParams.set("token", token);

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.error("[maintenance] target cleanup request failed", response.status);
      return;
    }
    console.info("[maintenance] target cleanup request completed");
  } catch (error) {
    console.error("[maintenance] target cleanup request failed", error);
  }
}
