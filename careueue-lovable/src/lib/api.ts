import { API_BASE } from "./config";
import { authStore } from "./auth";

export type QueueItem = {
  id: string;
  public_token: string;
  status: "Registered" | "Triaged" | "Waiting" | "Called" | "Completed";
  track_type: "Urgent" | "Routine" | null;
  priority_score: number;
  t1_check_in: string;
  dynamic_priority: number;
};

export type CheckInResp = {
  id: string;
  public_token: string;
  status: string;
  track_type: string | null;
  priority_score: number;
  t1_check_in: string;
};

type Opts = {
  method?: string;
  body?: unknown;
  auth?: "staff" | "patient" | "none";
  form?: URLSearchParams;
};

export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const auth = opts.auth ?? "staff";
  if (auth === "staff") {
    const t = authStore.getStaffToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  } else if (auth === "patient") {
    const t = authStore.getPatientToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }

  let body: BodyInit | undefined;
  if (opts.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = opts.form.toString();
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? (opts.body || opts.form ? "POST" : "GET"),
    headers,
    body,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { detail?: string };
      if (j.detail) detail = j.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Endpoints
export const endpoints = {
  staffLogin: (username: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);
    return api<{ access_token: string; token_type: string; staff: { id: string; username: string; role: string } }>(
      "/auth/login",
      { form, auth: "none" },
    );
  },
  checkIn: (full_name: string, phone_number: string) =>
    api<CheckInResp>("/patients/check-in", { body: { full_name, phone_number } }),
  queue: () => api<QueueItem[]>("/queue/"),
  triage: (session_id: string, track_type: "Urgent" | "Routine") =>
    api(`/triage/${session_id}`, { body: { track_type } }),
  call: (session_id: string) => api(`/queue/${session_id}/call`, { method: "POST" }),
  complete: (session_id: string) => api(`/queue/${session_id}/complete`, { method: "POST" }),
  patientRequestOtp: (phone_number: string) =>
    api<{ message: string }>("/patient-auth/request-otp", { body: { phone_number }, auth: "none" }),
  patientVerifyOtp: (phone_number: string, otp_code: string) =>
    api<{ access_token: string; token_type: string; message: string }>("/patient-auth/verify-otp", {
      body: { phone_number, otp_code },
      auth: "none",
    }),
};
