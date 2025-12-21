// flashcards/src/context/CategoryContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { fetchCategoriesApi, createCategoryApi } from "../api/category.api";

export const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load Data
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      if (user) {
        // --- LOGGED IN: FETCH FROM API ---
        try {
          const data = await fetchCategoriesApi();
          setCategories(data);
        } catch (err) {
          console.error("Failed to load categories:", err);
        }
      } else {
        // --- GUEST: LOAD FROM STORAGE ---
        const local = JSON.parse(localStorage.getItem("guest_categories") || "[]");
        setCategories(local);
      }
      setLoading(false);
    };
    loadCategories();
  }, [user]);

  // 2. Add Category
  const addCategory = async (name, parentId) => {
    const payload = { name, parent_id: parentId };

    if (user) {
      // --- API ---
      try {
        const newCat = await createCategoryApi(payload);
        setCategories((prev) => [...prev, newCat]);
      } catch (err) {
        console.error("API Error:", err);
      }
    } else {
      // --- LOCAL STORAGE ---
      const newCat = { 
        ...payload, 
        id: Date.now().toString(), // Generate fake ID
        parentId // Keep frontend consistency
      }; 
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem("guest_categories", JSON.stringify(updated));
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
}