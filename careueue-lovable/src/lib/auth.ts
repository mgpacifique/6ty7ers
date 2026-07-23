import { useSyncExternalStore } from "react";

const STAFF_KEY = "cq_staff_token";
const STAFF_INFO = "cq_staff_info";
const PATIENT_KEY = "cq_patient_token";
const PATIENT_PHONE = "cq_patient_phone";

export type StaffInfo = { id: string; username: string; role: string };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function safeGet(k: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(k);
}
function safeSet(k: string, v: string | null) {
  if (typeof window === "undefined") return;
  if (v == null) window.localStorage.removeItem(k);
  else window.localStorage.setItem(k, v);
  emit();
}

export const authStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getStaffToken: () => safeGet(STAFF_KEY),
  getStaffInfo: (): StaffInfo | null => {
    const s = safeGet(STAFF_INFO);
    return s ? (JSON.parse(s) as StaffInfo) : null;
  },
  setStaff: (token: string, info: StaffInfo) => {
    safeSet(STAFF_KEY, token);
    safeSet(STAFF_INFO, JSON.stringify(info));
  },
  clearStaff: () => {
    safeSet(STAFF_KEY, null);
    safeSet(STAFF_INFO, null);
  },
  getPatientToken: () => safeGet(PATIENT_KEY),
  getPatientPhone: () => safeGet(PATIENT_PHONE),
  setPatient: (token: string, phone: string) => {
    safeSet(PATIENT_KEY, token);
    safeSet(PATIENT_PHONE, phone);
  },
  clearPatient: () => {
    safeSet(PATIENT_KEY, null);
    safeSet(PATIENT_PHONE, null);
  },
};

export function useStaffAuth() {
  const token = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getStaffToken(),
    () => null,
  );
  const info = useSyncExternalStore(
    authStore.subscribe,
    () => safeGet(STAFF_INFO),
    () => null,
  );
  return {
    token,
    staff: info ? (JSON.parse(info) as StaffInfo) : null,
  };
}
