import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { fetchFlashcardsApi, createFlashcardApi } from "../api/flashcard.api";

export const FlashcardContext = createContext(null);

export function FlashcardProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlashcards = async () => {
      setLoading(true);
      if (user) {
        try {
          const data = await fetchFlashcardsApi();
          setFlashcards(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        const local = JSON.parse(localStorage.getItem("guest_flashcards") || "[]");
        setFlashcards(local);
      }
      setLoading(false);
    };
    loadFlashcards();
  }, [user]);

  const addFlashcard = async (question, answer, categoryId) => {
    const payload = { question, answer, category_id: categoryId };

    if (user) {
      try {
        const newCard = await createFlashcardApi(payload);
        setFlashcards((prev) => [...prev, newCard]);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newCard = { 
        ...payload, 
        id: Date.now().toString(), 
        categoryId // Frontend camelCase
      };
      const updated = [...flashcards, newCard];
      setFlashcards(updated);
      localStorage.setItem("guest_flashcards", JSON.stringify(updated));
    }
  };

  return (
    <FlashcardContext.Provider value={{ flashcards, addFlashcard, loading }}>
      {children}
    </FlashcardContext.Provider>
  );
}