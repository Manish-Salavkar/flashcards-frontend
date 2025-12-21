import { apiClient } from "./client";

export async function fetchCategoriesApi() {
  const res = await apiClient("/api/category");
  if (!res.ok) throw new Error("Failed to fetch categories");

  const json = await res.json();
  // console.log("Raw API Response:", json);

  // FIX 1: specific check for your current structure [{ data: [...] }, 200]
  if (Array.isArray(json) && json[0] && json[0].data) {
    return json[0].data;
  }
  
  // FIX 2: standard check if response is just { data: [...] }
  if (json.data && Array.isArray(json.data)) {
    return json.data;
  }

  // Fallback: assume it's already the array
  return json;
}

export async function createCategoryApi(data) {
  const res = await apiClient("/api/category", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  
  const json = await res.json();
  
  // Apply the same fix here if create returns wrapped data
  if (Array.isArray(json) && json[0] && json[0].data) return json[0].data;
  if (json.data) return json.data;
  
  return json;
}