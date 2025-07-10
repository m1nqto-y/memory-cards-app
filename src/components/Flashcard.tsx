"use client";

import { useState, useEffect } from 'react';
import type { Flashcard as FlashcardType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  card: FlashcardType;
}

export function Flashcard({ card }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div
      className="w-full max-w-2xl h-80 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setIsFlipped(!isFlipped)}
      aria-label={`Flashcard. Front: ${card.term}. Click or press space to flip.`}
    >
      <div
        className={cn(
          'relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out',
          { 'rotate-y-180': isFlipped }
        )}
      >
        {/* Front of the card */}
        <Card className="absolute w-full h-full backface-hidden flex items-center justify-center">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-semibold font-headline">{card.term}</p>
          </CardContent>
        </Card>

        {/* Back of the card */}
        <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center">
          <CardContent className="p-6 text-center">
            <p className="text-2xl">{card.definition}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
