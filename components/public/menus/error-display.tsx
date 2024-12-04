import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="inline-block p-3 bg-destructive/10 rounded-full">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Error Loading Menus</h2>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </div>
  );
}