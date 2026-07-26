import { isTokenExpired, clearAuthData } from './auth';

const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

const getAuthToken = () => {
  const isStaffPath = window.location.pathname.startsWith('/staff');

  if (isStaffPath) {
    return localStorage.getItem('staff_access_token');
  }

  return localStorage.getItem('patient_access_token') ||
         localStorage.getItem('staff_access_token');
};

const API_BASE = getApiBase();

const handleTokenExpiry = () => {
  const isPatientPath = window.location.pathname.startsWith('/patient');
  clearAuthData();
  window.location.href = isPatientPath ? '/patient' : '/staff';
};

export async function apiPost(path, body) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    handleTokenExpiry();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
}

export async function apiGet(path) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (res.status === 401) {
    handleTokenExpiry();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
}

export async function apiPut(path, body) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    handleTokenExpiry();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
}

export async function apiDelete(path) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (res.status === 401) {
    handleTokenExpiry();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
}
