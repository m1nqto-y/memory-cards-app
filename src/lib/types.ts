import type { Timestamp } from "firebase/firestore";

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  userId: string;
  createdAt: Timestamp;
}
