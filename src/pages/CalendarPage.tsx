import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useNewsroom } from '@/context/NewsroomContext';
import { EventDetailDialog } from '@/components/calendar/EventDetailDialog';
import { ScheduleDialog } from '@/components/approval/ScheduleDialog';
import { useToast } from '@/hooks/use-toast';
import { Platform, CalendarEvent } from '@/types/newsroom';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Clock,
  GripVertical,
  CalendarIcon
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const platforms: Platform[] = ['linkedin', 'twitter', 'facebook'];

const platformIcons: Record<Platform, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
};

const platformColors: Record<Platform, string> = {
  linkedin: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
  twitter: 'bg-slate-500/10 border-slate-500/30 text-slate-700',
  instagram: 'bg-pink-500/10 border-pink-500/30 text-pink-700',
  facebook: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700',
};

export function CalendarPage() {
  const { toast } = useToast();
  const { calendarEvents, drafts, getNewsById, scheduleDraft, updateCalendarEvent, deleteCalendarEvent } = useNewsroom();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(platforms);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'platform'>('week');
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

  const getEventsForPlatform = (platform: Platform) => {
    return calendarEvents
      .filter(event => 
        event.platform === platform &&
        weekDays.some(day => isSameDay(event.scheduledAt, day))
      )
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEditDate(event.scheduledAt);
    setEditTime(format(event.scheduledAt, 'HH:mm'));
  };

  const handleSaveEdit = () => {
    if (!editingEvent || !editDate) return;
    
    const [hours, minutes] = editTime.split(':').map(Number);
    const newDate = setMinutes(setHours(editDate, hours), minutes);
    
    updateCalendarEvent(editingEvent.id, { scheduledAt: newDate });
    scheduleDraft(editingEvent.postId, newDate);
    
    toast({
      title: 'Evento actualizado',
      description: `Reprogramado para ${format(newDate, "d MMM, HH:mm", { locale: es })}`,
    });
    
    setEditingEvent(null);
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

    updateCalendarEvent(draggedEventId, { scheduledAt: newDate });
    scheduleDraft(event.postId, newDate);
    
    toast({ 
      title: 'Evento reprogramado',
      description: `Movido a ${format(newDate, "d MMM, HH:mm", { locale: es })}`
    });
    
    setDraggedEventId(null);
  };

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  // Vista por Plataforma
  const renderPlatformView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {platforms.map(platform => {
        const Icon = platformIcons[platform];
        const events = getEventsForPlatform(platform);
        
        return (
          <Card key={platform} className={cn("shadow-card", platformColors[platform])}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-5 w-5" />
                {platform === 'twitter' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                <Badge variant="secondary" className="ml-auto">
                  {events.length} posts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin posts programados esta semana
                </p>
              ) : (
                events.map(event => {
                  const draft = drafts.find(d => d.id === event.postId);
                  const newsItem = draft ? getNewsById(draft.newsItemId) : null;
                  
                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-background border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleEventClick(event.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {format(event.scheduledAt, "EEE d, HH:mm", { locale: es })}
                          </span>
                        </div>
                        <StatusBadge status={event.status} size="sm" />
                      </div>
                      <p className="text-sm line-clamp-2">{event.title}</p>
                      {draft && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          V{draft.variant}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                      >
                        Cambiar fecha/hora
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Vista Semanal
  const renderWeekView = () => (
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
                    {events.map(event => {
                      const draft = drafts.find(d => d.id === event.postId);
                      
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event.id)}
                          onClick={() => handleEventClick(event.id)}
                          className="p-2 rounded-md bg-surface border border-border shadow-card mb-1 cursor-pointer hover:shadow-soft transition-shadow group"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            <PlatformBadge platform={event.platform} showLabel={false} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {format(event.scheduledAt, 'HH:mm')}
                            </span>
                            {draft && (
                              <Badge variant="outline" className="text-xs h-4 px-1 ml-auto">
                                V{draft.variant}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-medium line-clamp-2">{event.title}</p>
                          <div className="mt-1">
                            <StatusBadge status={event.status} size="sm" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <PageHeader 
        title="Calendario de Publicaciones"
        subtitle={format(currentDate, "MMMM yyyy", { locale: es })}
        actions={
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  viewMode === 'week'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('platform')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  viewMode === 'platform'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Por Red
              </button>
            </div>
            
            {/* Platform Filter */}
            <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
              {platforms.map(platform => {
                const Icon = platformIcons[platform];
                return (
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
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
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
            {format(weekStart, "d MMM", { locale: es })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
          </h2>
        </div>

        {/* Calendar View */}
        {viewMode === 'week' ? renderWeekView() : renderPlatformView()}
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          💡 {viewMode === 'week' 
            ? 'Arrastra los posts para reprogramarlos. Haz clic para ver detalles.' 
            : 'Haz clic en un post para ver detalles o cambiar la fecha/hora.'}
        </p>
      </div>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Popover open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
          <PopoverContent className="w-auto p-4" align="center">
            <div className="space-y-4">
              <h4 className="font-medium">Cambiar fecha y hora</h4>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Calendar
                  mode="single"
                  selected={editDate}
                  onSelect={setEditDate}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
              <div className="space-y-2">
                <Label>Hora (Europe/Madrid)</Label>
                <Input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingEvent(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  Guardar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

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
