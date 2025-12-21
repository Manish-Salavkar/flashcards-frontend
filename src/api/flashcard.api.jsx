// src/api/flashcard.api.jsx
import { apiClient } from "./client";

export async function fetchFlashcardsApi() {
  const res = await apiClient("/api/flashcard/all/"); 
  if (!res.ok) throw new Error("Failed to fetch flashcards");
  const json = await res.json();
  if (Array.isArray(json) && json[0] && json[0].data) return json[0].data;
  if (json.data) return json.data;
  return json;
}

export async function createFlashcardApi(data) {
  const res = await apiClient("/api/flashcard", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create flashcard");
  const json = await res.json();
  if (Array.isArray(json) && json[0] && json[0].data) return json[0].data;
  if (json.data) return json.data;
  return json;
}

export async function updateFlashcardApi(id, data) {
  const res = await apiClient(`/api/flashcard/${id}`, { 
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update flashcard");
  return res.json();
}

export async function deleteFlashcardApi(id) {
  const res = await apiClient(`/api/flashcard/${id}`, { 
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete flashcard");
  return res.json();
}

export async function bulkDeleteFlashcardsApi(ids) {
  const res = await apiClient("/api/flashcard/bulk-delete/", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to bulk delete");
  return res.json();
}