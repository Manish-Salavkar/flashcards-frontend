import { apiClient } from "./client";

export async function fetchCategoriesApi() {
  const res = await apiClient("/api/category/"); // Added trailing slash to be safe
  if (!res.ok) throw new Error("Failed to fetch categories");

  const json = await res.json();

  if (Array.isArray(json) && json[0] && json[0].data) {
    return json[0].data;
  }
  
  if (json.data && Array.isArray(json.data)) {
    return json.data;
  }

  return json;
}

export async function createCategoryApi(data) {
  const res = await apiClient("/api/category/", { // Added trailing slash
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  
  const json = await res.json();
  
  if (Array.isArray(json) && json[0] && json[0].data) return json[0].data;
  if (json.data) return json.data;
  
  return json;
}

// --- FIXED CRUD OPERATIONS ---

export async function updateCategoryApi(id, data) {
  // ✅ FIX: Use Query Param (?category_id=...) instead of Path Param (/${id})
  const res = await apiClient(`/api/category/?category_id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategoryApi(id) {
  // ✅ FIX: Use Query Param here too
  const res = await apiClient(`/api/category/?category_id=${id}`, {
    method: "DELETE",
  });
  
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}