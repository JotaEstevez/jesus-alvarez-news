import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useNewsroom } from '@/context/NewsroomContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Evita acoplar este layout al tipo del contexto (solo leemos campos opcionales).
  const newsroom: any = useNewsroom();
  const loading = Boolean(newsroom?.loading);
  const error: string | null = newsroom?.error ?? null;
  const dataLoaded = Boolean(newsroom?.dataLoaded);
  const reload: undefined | (() => Promise<void>) = newsroom?.reload;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 transition-all duration-300">
        <div className="min-h-screen">
          {loading && !dataLoaded && (
            <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
              <div className="px-6 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Cargando datos…
              </div>
            </div>
          )}

          {error && (
            <div className="px-6 pt-4">
              <Alert variant="destructive" className="flex items-start justify-between gap-4">
                <div>
                  <AlertTitle>Error de conexión</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => reload?.()}>
                  Reintentar
                </Button>
              </Alert>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
