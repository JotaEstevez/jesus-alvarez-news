import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { PostDraft } from '@/types/newsroom';
import { useNewsroom } from '@/context/NewsroomContext';
import { ScheduleDialog } from '@/components/approval/ScheduleDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
}

export function EventDetailDialog({ open, onOpenChange, eventId }: EventDetailDialogProps) {
  const { calendarEvents, drafts, newsItems, scheduleDraft, updateCalendarEvent } = useNewsroom();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  const event = calendarEvents.find(e => e.id === eventId);
  const draft = event ? drafts.find(d => d.id === event.postId) : null;
  const news = draft ? newsItems.find(n => n.id === draft.newsItemId) : null;

  if (!event || !draft) return null;

  const handleReschedule = (newDate: Date) => {
    scheduleDraft(draft.id, newDate);
    updateCalendarEvent(event.id, { scheduledAt: newDate });
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
              <p className="text-sm text-muted-foreground mb-2">Contenido</p>
              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {draft.content}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Reprogramar
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
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
