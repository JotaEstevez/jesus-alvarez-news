import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNewsroom } from '@/context/NewsroomContext';
import { EventDetailDialog } from '@/components/calendar/EventDetailDialog';
import { ScheduleDialog } from '@/components/approval/ScheduleDialog';
import { useToast } from '@/hooks/use-toast';
import { Platform } from '@/types/newsroom';
import { 
  ChevronLeft, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const platforms: Platform[] = ['linkedin', 'twitter', 'instagram', 'facebook'];

export function CalendarPage() {
  const { toast } = useToast();
  const { calendarEvents, drafts, scheduleDraft, updateCalendarEvent } = useNewsroom();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(platforms);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(event => 
      isSameDay(event.scheduledAt, date) && 
      selectedPlatforms.includes(event.platform)
    );
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEventId(eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: Date, time: string) => {
    e.preventDefault();
    if (!draggedEventId) return;

    const event = calendarEvents.find(ev => ev.id === draggedEventId);
    if (!event) return;

    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(day);
    newDate.setHours(hours, minutes, 0, 0);

    // Update the calendar event and draft
    updateCalendarEvent(draggedEventId, { scheduledAt: newDate });
    scheduleDraft(event.postId, newDate);
    
    toast({ 
      title: 'Evento reprogramado',
      description: `Movido a ${format(newDate, "d MMM, HH:mm", { locale: es })}`
    });
    
    setDraggedEventId(null);
  };

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  return (
    <MainLayout>
      <PageHeader 
        title="Calendario de Publicaciones"
        subtitle={format(currentDate, "MMMM yyyy", { locale: es })}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    selectedPlatforms.includes(platform)
                      ? 'bg-background shadow-sm'
                      : 'opacity-40 hover:opacity-70'
                  )}
                >
                  <PlatformBadge platform={platform} showLabel={false} size="sm" />
                </button>
              ))}
            </div>
            <Button className="gap-2" onClick={() => setRescheduleDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo Post
            </Button>
          </div>
        }
      />
      
      <div className="p-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>
              Hoy
            </Button>
          </div>
          <h2 className="text-lg font-semibold">
            {format(weekStart, "d MMM", { locale: es })} - {format(addDays(weekStart, 6), "d MMM", { locale: es })}
          </h2>
        </div>

        {/* Calendar Grid */}
        <Card className="shadow-soft overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-3 text-xs font-medium text-muted-foreground border-r border-border">
                Hora
              </div>
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const dayEvents = getEventsForDay(day);
                return (
                  <div 
                    key={index} 
                    className={cn(
                      'p-3 text-center border-r border-border last:border-r-0',
                      isToday && 'bg-accent/5'
                    )}
                  >
                    <p className="text-xs text-muted-foreground">
                      {format(day, 'EEE', { locale: es })}
                    </p>
                    <p className={cn(
                      'text-lg font-semibold mt-1',
                      isToday && 'text-accent'
                    )}>
                      {format(day, 'd')}
                    </p>
                    {dayEvents.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {dayEvents.length} post{dayEvents.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="max-h-[600px] overflow-auto">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-8 border-b border-border last:border-b-0">
                  <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-start justify-end pr-3">
                    {time}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const events = getEventsForDay(day).filter(e => 
                      format(e.scheduledAt, 'HH:00') === time
                    );
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div 
                        key={dayIndex} 
                        className={cn(
                          'p-1 min-h-[60px] border-r border-border last:border-r-0',
                          isToday && 'bg-accent/5',
                          draggedEventId && 'hover:bg-muted/50'
                        )}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, time)}
                      >
                        {events.map(event => (
                          <div
                            key={event.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event.id)}
                            onClick={() => handleEventClick(event.id)}
                            className="p-2 rounded-md bg-surface border border-border shadow-card mb-1 cursor-pointer hover:shadow-soft transition-shadow"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <PlatformBadge platform={event.platform} showLabel={false} size="sm" />
                              <span className="text-xs text-muted-foreground">
                                {format(event.scheduledAt, 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-xs font-medium line-clamp-2">{event.title}</p>
                            <div className="mt-1">
                              <StatusBadge status={event.status} size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          💡 Arrastra los posts para reprogramarlos. Haz clic para ver detalles.
        </p>
      </div>

      <EventDetailDialog
        open={eventDetailOpen}
        onOpenChange={setEventDetailOpen}
        eventId={selectedEventId}
      />
      
      <ScheduleDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        onSchedule={(date) => {
          toast({ title: 'Funcionalidad en desarrollo', description: 'Usa el generador para crear nuevos posts.' });
        }}
      />
    </MainLayout>
  );
}
