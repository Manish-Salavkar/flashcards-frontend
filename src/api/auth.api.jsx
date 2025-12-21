// src/api/auth.api.jsx
import { apiClient } from "./client";

export async function loginRequest(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const res = await apiClient("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }

  return res.json();
}

export async function registerRequest(email, password) {
  const res = await apiClient("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify({ 
      email: email, 
      password: password 
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    const msg = err.detail || (err[0] ? err[0].message : "Registration failed");
    throw new Error(msg);
  }

  return res.json();
}