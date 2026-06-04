import { appendFileSync } from "fs";
import { join } from "path";

export const AGENT_DEBUG_LOG_PATH = join(import.meta.dir, "../../../debug-d14199.log");

export function agentDebug(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) {
  const payload = {
    sessionId: "d14199",
    location,
    message,
    data,
    timestamp: Date.now(),
    hypothesisId,
  };
  // #region agent log
  console.log(`[agent-debug] ${location} ${message}`, data);
  try {
    appendFileSync(AGENT_DEBUG_LOG_PATH, JSON.stringify(payload) + "\n");
  } catch (err) {
    console.error("[agent-debug] file write failed", AGENT_DEBUG_LOG_PATH, err);
  }
  fetch("http://127.0.0.1:7267/ingest/6f4c4dd9-6c97-433d-9bb3-f408539522b2", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d14199" },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
}

agentDebug("debug-log.ts", "module loaded", { logPath: AGENT_DEBUG_LOG_PATH }, "H1");
