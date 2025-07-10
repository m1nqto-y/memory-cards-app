import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { ProfileButton } from './ProfileButton';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
            <BrainCircuit className="h-6 w-6 text-primary" />
            MemoryMaster
          </Link>
          <div className="flex items-center space-x-4">
            <ProfileButton />
          </div>
        </div>
      </div>
    </header>
  );
}
