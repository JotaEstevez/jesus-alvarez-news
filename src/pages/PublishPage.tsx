import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNewsroom } from '@/context/NewsroomContext';
import { useToast } from '@/hooks/use-toast';
import { Platform } from '@/types/newsroom';
import { Copy, Send, CheckCircle2, Filter } from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const platforms: Platform[] = ['linkedin', 'twitter', 'instagram', 'facebook'];

export function PublishPage() {
  const { toast } = useToast();
  const { drafts, newsItems, updateDraftStatus } = useNewsroom();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(platforms);

  // Get approved posts that are scheduled for today or past, or approved without schedule
  const postsToPublish = drafts.filter(draft => {
    if (draft.status !== 'approved') return false;
    if (!selectedPlatforms.includes(draft.platform)) return false;
    
    if (draft.scheduledAt) {
      const scheduledDate = startOfDay(draft.scheduledAt);
      const today = startOfDay(new Date());
      return isBefore(scheduledDate, today) || isToday(draft.scheduledAt);
    }
    
    return true; // Approved without schedule = ready to publish
  });

  const getNewsTitle = (newsItemId: string) => {
    const news = newsItems.find(n => n.id === newsItemId);
    return news?.title || 'Noticia no encontrada';
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copiado al portapapeles',
        description: 'El contenido del post ha sido copiado.',
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido.',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = (draftId: string) => {
    updateDraftStatus(draftId, 'published');
    toast({
      title: 'Post marcado como publicado',
      description: 'El post ha sido movido a publicados.',
    });
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Para Publicar"
        subtitle={`${postsToPublish.length} posts listos para publicar`}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar redes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              {platforms.map(platform => (
                <DropdownMenuCheckboxItem
                  key={platform}
                  checked={selectedPlatforms.includes(platform)}
                  onCheckedChange={() => togglePlatform(platform)}
                >
                  <PlatformBadge platform={platform} size="sm" />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="p-6 space-y-4">
        {postsToPublish.map((draft, index) => (
          <Card
            key={draft.id}
            className="shadow-card animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Platform Badge */}
                <PlatformBadge platform={draft.platform} showLabel={false} size="lg" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-2">
                    {getNewsTitle(draft.newsItemId)}
                  </p>
                  
                  {/* Full content visible */}
                  <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap mb-3 border">
                    {draft.content}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {draft.scheduledAt && (
                      <span>
                        Programado: {format(draft.scheduledAt, "d MMM, HH:mm", { locale: es })}
                      </span>
                    )}
                    <span>Variante {draft.variant}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleCopy(draft.content)}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => handlePublish(draft.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Publicado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {postsToPublish.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay posts listos para publicar</p>
            <p className="text-sm">
              Los posts aprobados y programados para hoy aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
