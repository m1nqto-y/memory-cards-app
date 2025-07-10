"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Deck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Plus, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [decks, setDecks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const [newDeckName, setNewDeckName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateDeck = () => {
    if (newDeckName.trim() === '') {
      toast({
        title: 'Error',
        description: 'Deck name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: newDeckName,
      cards: [],
    };
    setDecks([...decks, newDeck]);
    setNewDeckName('');
    setIsDialogOpen(false);
    toast({
      title: 'Success!',
      description: `Deck "${newDeckName}" has been created.`,
    });
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this deck and all its cards?')) {
      const updatedDecks = decks.filter((deck) => deck.id !== deckId);
      setDecks(updatedDecks);
      toast({
        title: 'Deck Deleted',
        description: 'The deck has been removed.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">My Decks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
              <DialogDescription>
                Give your new deck a name to start adding flashcards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deck-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="deck-name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Japanese Vocabulary"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateDeck}>Create Deck</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {decks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Decks Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Create your first deck to start learning!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="font-headline">{deck.name}</CardTitle>
                <CardDescription>{deck.cards.length} card{deck.cards.length !== 1 && 's'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDeck(deck.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Deck</span>
                </Button>
                <Link href={`/decks/${deck.id}`} passHref>
                  <Button asChild variant="outline">
                    <a>
                      View Deck <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
