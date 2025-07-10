"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Deck, Flashcard as FlashcardType } from '@/lib/types';
import { Flashcard } from '@/components/Flashcard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, RotateCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDecks } from '@/hooks/useDecks';

export default function ReviewPage() {
  const params = useParams();
  const { id } = params;
  const { decks, loading } = useDecks();

  const deck = useMemo(() => decks.find((d: Deck) => d.id === id), [decks, id]);

  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shuffleCards = (cards: FlashcardType[]) => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentIndex(0);
  };
  
  useEffect(() => {
    if (deck && deck.cards) {
      shuffleCards(deck.cards);
    }
  }, [deck]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!deck) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">デッキが見つかりません</h1>
        <Button asChild variant="link" className="mt-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> デッキ一覧に戻る
            </Link>
        </Button>
      </div>
    );
  }
  
  if (!deck.cards || shuffledCards.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">このデッキは空です</h1>
        <p className="text-muted-foreground">復習セッションを開始するには、カードを追加してください。</p>
        <Button asChild variant="link" className="mt-4">
            <Link href={`/decks/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> デッキに戻る
            </Link>
        </Button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;
  const currentCard = shuffledCards[currentIndex];

  const goToNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 h-full">
        <div className="w-full max-w-2xl space-y-2">
            <Link href={`/decks/${id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> {deck.name} に戻る
            </Link>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium tabular-nums">{currentIndex + 1} / {shuffledCards.length}</p>
                 <Button variant="ghost" size="sm" onClick={() => shuffleCards(deck.cards || [])}>
                    <RotateCw className="mr-2 h-4 w-4" /> 再シャッフル
                </Button>
            </div>
            <Progress value={progress} />
        </div>
        
        <div className="w-full max-w-2xl flex-grow flex items-center justify-center">
          {currentCard && <Flashcard card={currentCard} />}
        </div>
        
        <div className="flex items-center justify-center gap-4 w-full max-w-2xl">
            <Button size="lg" variant="outline" onClick={goToPrev} disabled={currentIndex === 0}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button size="lg" onClick={goToNext} disabled={currentIndex >= shuffledCards.length - 1} className="flex-grow bg-accent hover:bg-accent/90 text-accent-foreground">
                次のカード <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
    </div>
  );
}
