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
      toast({ title: 'エラー', description: '用語と定義は空にできません。', variant: 'destructive' });
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
    toast({ title: '成功しました！', description: '新しいカードがデッキに追加されました。' });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!deck) return;
    if (window.confirm('このカードを本当に削除しますか？')) {
      const updatedDecks = decks.map((d) =>
        d.id === id ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d
      );
      setDecks(updatedDecks);
      toast({ title: 'カードが削除されました', description: 'カードがデッキから削除されました。', variant: 'destructive'});
    }
  };

  if (!deck) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">デッキが見つかりません</h1>
            <p className="text-muted-foreground">このデッキは削除された可能性があります。</p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> デッキ一覧に戻る
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
              <Play className="mr-2 h-4 w-4" /> 復習を開始
            </Button>
          </Link>
        )}
      </div>

      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> 新しいカードを追加
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新しいカードを追加</DialogTitle>
            <DialogDescription>新しい単語カードの用語と定義を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">用語</Label>
              <Input id="term" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} className="col-span-3" placeholder="例：こんにちは" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="definition" className="text-right pt-2">定義</Label>
              <Textarea id="definition" value={newDefinition} onChange={(e) => setNewDefinition(e.target.value)} className="col-span-3" placeholder="例：Hello" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddCard}>カードを追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {deck.cards.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <FilePlus2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">このデッキは空です</h2>
            <p className="mt-2 text-muted-foreground">最初のカードを追加して、デッキの作成を始めましょう。</p>
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
