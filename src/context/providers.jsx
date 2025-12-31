// flashcards/src/context/providers.jsx
import React, { createContext, useState, useEffect } from 'react';
import { loginRequest, registerRequest } from '../api/auth.api'; 
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../api/category.api';
import { 
  fetchFlashcardsApi, 
  createFlashcardApi, 
  updateFlashcardApi, 
  deleteFlashcardApi, 
  bulkDeleteFlashcardsApi 
} from '../api/flashcard.api';

// Export Contexts so pages can consume them
export const ThemeContext = createContext();
export const AuthContext = createContext();
export const DataContext = createContext();

export const AppProviders = ({ children }) => {
  // --- 1. THEME LOGIC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // --- 2. AUTH LOGIC ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const user = token ? { type: 'user' } : null; 

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
  };

  const register = async (email, password) => {
    // 1. Call API
    await registerRequest(email, password);
    // 2. Auto-login on success
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // --- 3. DATA LOGIC (Categories & Flashcards) ---
  const [categories, setCategories] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Data Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        // --- API MODE ---
        try {
          const [cats, cards] = await Promise.all([fetchCategoriesApi(), fetchFlashcardsApi()]);
          setCategories(cats);
          setFlashcards(cards);
        } catch (err) {
          console.error("Failed to load data", err);
        }
      } else {
        // --- GUEST MODE (LocalStorage) ---
        const localCats = JSON.parse(localStorage.getItem('guest_categories') || '[]');
        const localCards = JSON.parse(localStorage.getItem('guest_flashcards') || '[]');
        setCategories(localCats);
        setFlashcards(localCards);
      }
      setLoading(false);
    };
    loadData();
  }, [token]); 

  // --- ACTIONS ---

const addCategory = async (name, parentId) => {
    const payload = { name, parent_id: parentId };
    if (token) {
      const newCat = await createCategoryApi(payload);
      setCategories(prev => [...prev, newCat]);
    } else {
      const newCat = { ...payload, id: Date.now().toString(), parentId }; 
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem('guest_categories', JSON.stringify(updated));
    }
  };

  // --- NEW: UPDATE CATEGORY ---
  const updateCategory = async (id, name, parentId) => {
    const target = categories.find(c => c.id === id);
    if (target && target.name.toLowerCase() === 'general') {
      alert("The 'General' category cannot be modified.");
      return;
    }

    const payload = { name, parent_id: parentId };

    if (token) {
      await updateCategoryApi(id, payload);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
    } else {
      const updated = categories.map(c => c.id === id ? { ...c, name, parentId } : c);
      setCategories(updated);
      localStorage.setItem('guest_categories', JSON.stringify(updated));
    }
  };

  // --- NEW: DELETE CATEGORY ---
const deleteCategory = async (id) => {
    const target = categories.find(c => c.id === id);
    if (target && target.name.toLowerCase() === 'general') {
      alert("The 'General' category cannot be deleted.");
      return;
    }

    const getIdsToDelete = (parentId) => {
      const children = categories.filter(c => (c.parent_id || c.parentId) == parentId);
      let ids = [parentId];
      children.forEach(child => {
        ids = [...ids, ...getIdsToDelete(child.id)];
      });
      return ids;
    };

    const idsToRemove = getIdsToDelete(id);

    if (token) {
      await deleteCategoryApi(id);
      
      setCategories(prev => prev.filter(c => !idsToRemove.includes(c.id)));
      
      setFlashcards(prev => prev.filter(f => !idsToRemove.includes(f.category_id || f.categoryId)));
      
    } else {
      const updatedCats = categories.filter(c => !idsToRemove.includes(c.id));
      const updatedCards = flashcards.filter(f => !idsToRemove.includes(f.category_id || f.categoryId));
      
      setCategories(updatedCats);
      setFlashcards(updatedCards);
      
      localStorage.setItem('guest_categories', JSON.stringify(updatedCats));
      localStorage.setItem('guest_flashcards', JSON.stringify(updatedCards));
    }
  };

  const addFlashcard = async (question, answer, categoryId) => {
    const payload = { 
      question, 
      answer, 
      category_id: parseInt(categoryId, 10) 
    };

    if (token) {
      const newCard = await createFlashcardApi(payload);
      setFlashcards(prev => [...prev, newCard]);
    } else {
      const newCard = { ...payload, id: Date.now().toString(), categoryId };
      const updated = [...flashcards, newCard];
      setFlashcards(updated);
      localStorage.setItem('guest_flashcards', JSON.stringify(updated));
    }
  };

  const updateFlashcard = async (id, question, answer, categoryId) => {
    // FIX: Ensure categoryId is an Integer
    const payload = { 
      question, 
      answer, 
      category_id: parseInt(categoryId, 10) 
    };
    
    if (token) {
      // API Mode
      await updateFlashcardApi(id, payload);
      setFlashcards(prev => prev.map(f => f.id === id ? { ...f, ...payload } : f));
    } else {
      const updated = flashcards.map(f => f.id === id ? { ...f, ...payload, categoryId } : f);
      setFlashcards(updated);
      localStorage.setItem('guest_flashcards', JSON.stringify(updated));
    }
  };

  const deleteFlashcard = async (id) => {
    if (token) {
      await deleteFlashcardApi(id);
      setFlashcards(prev => prev.filter(f => f.id !== id));
    } else {
      const updated = flashcards.filter(f => f.id !== id);
      setFlashcards(updated);
      localStorage.setItem('guest_flashcards', JSON.stringify(updated));
    }
  };

  const bulkDeleteFlashcards = async (ids) => {
    if (token) {
      await bulkDeleteFlashcardsApi(ids);
      setFlashcards(prev => prev.filter(f => !ids.includes(f.id)));
    } else {
      const updated = flashcards.filter(f => !ids.includes(f.id));
      setFlashcards(updated);
      localStorage.setItem('guest_flashcards', JSON.stringify(updated));
    }
  };

return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, token, login, logout, register }}>
        <DataContext.Provider value={{ 
            categories, flashcards, loading,
            addCategory, updateCategory, deleteCategory,
            addFlashcard, updateFlashcard, deleteFlashcard, bulkDeleteFlashcards 
        }}>
          {children}
        </DataContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};