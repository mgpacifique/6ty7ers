import { useEffect, useState } from "react";
import { WS_URL } from "./config";

export type WsEvent =
  | { event: "NEW_PATIENT"; data: { session_id: string; public_token: string; status: string } }
  | { event: "PATIENT_TRIAGED"; data: { session_id: string; public_token: string; status: string; track_type: string; priority_score: number } }
  | { event: "PATIENT_CALLED"; data: { session_id: string; public_token: string; status: string } }
  | { event: "PATIENT_COMPLETED"; data: { session_id: string; public_token: string; status: string } }
  | { event: "QUEUE_STATS"; data: { total: number; urgent: number; routine: number; unassigned: number } };

export function useQueueSocket(onEvent: (e: WsEvent) => void) {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let ws: WebSocket | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;
    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        retry = setTimeout(connect, 3000);
        return;
      }
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (m) => {
        try {
          onEvent(JSON.parse(m.data) as WsEvent);
        } catch {
          /* ignore */
        }
      };
    };
    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return connected;
}
