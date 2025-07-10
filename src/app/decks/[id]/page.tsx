"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Deck, Flashcard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowLeft, Play, FilePlus2 } from 'lucide-react';

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [decks, setDecks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const { toast } = useToast();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  
  const deck = decks.find((d) => d.id === id);

  const handleAddCard = () => {
    if (!deck) return;
    if (newTerm.trim() === '' || newDefinition.trim() === '') {
      toast({ title: 'Error', description: 'Term and definition cannot be empty.', variant: 'destructive' });
      return;
    }

    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      term: newTerm,
      definition: newDefinition,
    };

    const updatedDecks = decks.map((d) =>
      d.id === id ? { ...d, cards: [...d.cards, newCard] } : d
    );
    setDecks(updatedDecks);

    setNewTerm('');
    setNewDefinition('');
    setIsAddCardOpen(false);
    toast({ title: 'Success!', description: 'New card added to the deck.' });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!deck) return;
    if (window.confirm('Are you sure you want to delete this card?')) {
      const updatedDecks = decks.map((d) =>
        d.id === id ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d
      );
      setDecks(updatedDecks);
      toast({ title: 'Card Deleted', description: 'The card has been removed.', variant: 'destructive'});
    }
  };

  if (!deck) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Deck not found</h1>
            <p className="text-muted-foreground">This deck may have been deleted.</p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go back to decks
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold font-headline flex-grow">{deck.name}</h1>
        {deck.cards.length > 0 && (
          <Link href={`/decks/${id}/review`} passHref>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Play className="mr-2 h-4 w-4" /> Start Review
            </Button>
          </Link>
        )}
      </div>

      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add New Card
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>Enter the term and definition for your new flashcard.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">Term</Label>
              <Input id="term" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} className="col-span-3" placeholder="e.g., こんにちは" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="definition" className="text-right pt-2">Definition</Label>
              <Textarea id="definition" value={newDefinition} onChange={(e) => setNewDefinition(e.target.value)} className="col-span-3" placeholder="e.g., Hello" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddCard}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {deck.cards.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <FilePlus2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">This deck is empty</h2>
            <p className="mt-2 text-muted-foreground">Add your first card to start building your deck.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
            {deck.cards.map(card => (
                <Card key={card.id} className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{card.term}</p>
                        <p className="text-sm text-muted-foreground">{card.definition}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                    </Button>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
