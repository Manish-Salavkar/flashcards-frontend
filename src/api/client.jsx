// flashcards/src/api/client.jsx
import { API_BASE_URL } from "../config/env";

export async function apiClient(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return res;
}