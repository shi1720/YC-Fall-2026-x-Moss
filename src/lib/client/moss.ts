export interface MossStatus {
  status: "disconnected" | "connecting" | "ready" | "error" | "expired";
  phase?: string;
  error?: string;
  indexName?: string;
  expiresAt?: number;
  sharedMode?: "mock" | "moss";
  runtime?: { mode: string; docCount: number; model: string };
}
export async function readMossStatus(): Promise<MossStatus> {
  const response = await fetch("/api/moss", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load Moss settings. Please retry.");
  return response.json();
}
