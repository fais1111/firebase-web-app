import { ShieldCheck } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-7 w-7 text-primary" />
      <span className="font-headline font-bold text-xl text-foreground">
        Survival Life
      </span>
    </div>
  );
}
