"use client";

import { useState } from 'react';
import Link from 'next/link';
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
import { Plus, Trash2, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDecks } from '@/hooks/useDecks';

export default function Home() {
  const { decks, loading, addDeck, deleteDeck } = useDecks();
  const [newDeckName, setNewDeckName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateDeck = async () => {
    if (newDeckName.trim() === '') {
      toast({
        title: 'エラー',
        description: 'デッキ名を入力してください。',
        variant: 'destructive',
      });
      return;
    }
    try {
      await addDeck({ name: newDeckName });
      toast({
        title: '成功しました！',
        description: `デッキ「${newDeckName}」が作成されました。`,
      });
      setNewDeckName('');
      setIsDialogOpen(false);
    } catch (error) {
       toast({
        title: 'エラー',
        description: 'デッキの作成に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (window.confirm('このデッキとすべてのカードを本当に削除しますか？')) {
      try {
        await deleteDeck(deckId);
        toast({
          title: 'デッキを削除しました',
          description: 'デッキが削除されました。',
          variant: 'destructive'
        });
      } catch (error) {
        toast({
          title: 'エラー',
          description: 'デッキの削除に失敗しました。',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">マイデッキ</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 新しいデッキを作成
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>新しいデッキを作成</DialogTitle>
              <DialogDescription>
                新しいデッキに名前を付けて、単語カードの追加を始めましょう。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deck-name" className="text-right">
                  名前
                </Label>
                <Input
                  id="deck-name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="col-span-3"
                  placeholder="例：日本語の語彙"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateDeck}>デッキを作成</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : decks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">まだデッキがありません</h2>
            <p className="mt-2 text-muted-foreground">
              最初のデッキを作成して学習を始めましょう！
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="font-headline">{deck.name}</CardTitle>
                <CardDescription>{deck.cards?.length || 0} 枚のカード</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDeck(deck.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">デッキを削除</span>
                </Button>
                <Link href={`/decks/${deck.id}`} passHref>
                  <Button asChild variant="outline">
                    <a>
                      デッキを見る <ChevronRight className="ml-2 h-4 w-4" />
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
