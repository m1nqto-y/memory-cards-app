"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import type { Deck, Flashcard } from '@/lib/types';
import { useToast } from './use-toast';

export function useDecks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (user) {
      setLoading(true);
      const q = query(collection(db, 'decks'), where('userId', '==', user.uid));
      
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const decksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Deck));
        setDecks(decksData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching decks:", error);
        toast({ title: 'エラー', description: 'デッキの読み込みに失敗しました。', variant: 'destructive' });
        setLoading(false);
      });
    } else {
      setDecks([]);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [user, toast]);

  const addDeck = async (newDeckData: { name: string }) => {
    if (!user) throw new Error("User not logged in");
    await addDoc(collection(db, 'decks'), {
      ...newDeckData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      cards: [],
    });
  };

  const deleteDeck = async (deckId: string) => {
    if (!user) throw new Error("User not logged in");
    await deleteDoc(doc(db, 'decks', deckId));
  };
  
  const addCardToDeck = async (deckId: string, newCardData: { term: string; definition: string }) => {
    if (!user) throw new Error("User not logged in");
    const deckRef = doc(db, 'decks', deckId);
    const newCard: Flashcard = {
        id: crypto.randomUUID(),
        ...newCardData
    }
    await updateDoc(deckRef, {
      cards: arrayUnion(newCard)
    });
  };
  
  const deleteCardFromDeck = async (deckId: string, cardId: string) => {
    if (!user) throw new Error("User not logged in");
    const deckRef = doc(db, 'decks', deckId);
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    const cardToDelete = deck.cards.find(c => c.id === cardId);
    if (!cardToDelete) return;

    await updateDoc(deckRef, {
        cards: arrayRemove(cardToDelete)
    });
  };

  return { decks, loading, addDeck, deleteDeck, addCardToDeck, deleteCardFromDeck };
}
