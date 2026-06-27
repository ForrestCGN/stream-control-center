import { apiRequest } from "./apiClient.js";

export async function getLocalServerStatus() { return apiRequest("/api/_status"); }
export async function getLocalStreamStatusCurrent() { return apiRequest("/api/stream-status/current"); }
export async function getLocalWebSocketStatus() { return apiRequest("/api/diag/ws"); }

export async function getLocalStreamPcStatusReadOnly() {
  const results = await Promise.allSettled([getLocalServerStatus(), getLocalStreamStatusCurrent(), getLocalWebSocketStatus()]);
  const [server, stream, ws] = results.map((result) => result.status === "fulfilled" ? result.value : null);
  const errors = results.filter((result) => result.status === "rejected").map((result) => result.reason?.message || String(result.reason));
  return { ok: errors.length === 0, readOnly: true, server, stream, ws, errors, fetchedAt: new Date().toISOString(), routes: ["GET /api/_status", "GET /api/stream-status/current", "GET /api/diag/ws"] };
}
