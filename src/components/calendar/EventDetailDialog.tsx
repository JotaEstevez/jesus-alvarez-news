import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useNewsroom } from '@/context/NewsroomContext';
import { useToast } from '@/hooks/use-toast';
import { ScheduleDialog } from '@/components/approval/ScheduleDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Copy, CheckCircle2 } from 'lucide-react';

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
}

export function EventDetailDialog({ open, onOpenChange, eventId }: EventDetailDialogProps) {
  const { calendarEvents, drafts, newsItems, scheduleDraft, updateCalendarEvent, updateDraftStatus } = useNewsroom();
  const { toast } = useToast();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  const event = calendarEvents.find(e => e.id === eventId);
  const draft = event ? drafts.find(d => d.id === event.postId) : null;
  const news = draft ? newsItems.find(n => n.id === draft.newsItemId) : null;

  if (!event || !draft) return null;

  const handleReschedule = (newDate: Date) => {
    scheduleDraft(draft.id, newDate);
    updateCalendarEvent(event.id, { scheduledAt: newDate });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);
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

  const handleMarkPublished = () => {
    updateDraftStatus(draft.id, 'published');
    updateCalendarEvent(event.id, { status: 'published' });
    toast({
      title: 'Post marcado como publicado',
      description: 'El post ha sido movido a publicados.',
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlatformBadge platform={event.platform} />
              Detalle del Post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Noticia origen</p>
              <p className="font-medium">{news?.title || event.title}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estado</p>
                <StatusBadge status={event.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Programado</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(event.scheduledAt, "d 'de' MMMM, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Contenido del post</p>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-[250px] overflow-y-auto border">
                {draft.content}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Reprogramar
              </Button>
              {event.status !== 'published' && (
                <Button onClick={handleMarkPublished} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar Publicado
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSchedule={handleReschedule}
        currentSchedule={event.scheduledAt}
      />
    </>
  );
}
