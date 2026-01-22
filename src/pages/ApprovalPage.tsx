import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDrafts, mockNewsItems } from '@/data/mockData';
import { PostDraft, PostStatus } from '@/types/newsroom';
import { ScheduleDialog } from '@/components/approval/ScheduleDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Calendar,
  Clock,
  MoreHorizontal,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusTabs: { value: PostStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'reviewed', label: 'Revisados' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'published', label: 'Publicados' },
];

export function ApprovalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PostStatus | 'all'>('all');
  const [drafts, setDrafts] = useState<PostDraft[]>(mockDrafts);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<PostDraft | null>(null);

  const filteredDrafts = activeTab === 'all' 
    ? drafts 
    : drafts.filter(draft => draft.status === activeTab);

  const getNewsTitle = (newsItemId: string) => {
    const news = mockNewsItems.find(n => n.id === newsItemId);
    return news?.title || 'Noticia no encontrada';
  };

  const getStatusCounts = () => {
    return {
      all: drafts.length,
      pending: drafts.filter(d => d.status === 'pending').length,
      reviewed: drafts.filter(d => d.status === 'reviewed').length,
      approved: drafts.filter(d => d.status === 'approved').length,
      published: drafts.filter(d => d.status === 'published').length,
    };
  };

  const counts = getStatusCounts();

  const updateDraftStatus = (draftId: string, newStatus: PostStatus, message: string) => {
    setDrafts(prev => prev.map(d => 
      d.id === draftId 
        ? { ...d, status: newStatus, updatedAt: new Date() } 
        : d
    ));
    toast({ title: message });
  };

  const handleApprove = (draft: PostDraft) => {
    updateDraftStatus(draft.id, 'approved', `Post aprobado correctamente`);
  };

  const handleReview = (draft: PostDraft) => {
    updateDraftStatus(draft.id, 'reviewed', `Post marcado como revisado`);
  };

  const handlePublish = (draft: PostDraft) => {
    updateDraftStatus(draft.id, 'published', `Post marcado como publicado`);
  };

  const handleReject = (draft: PostDraft) => {
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    toast({ title: 'Post rechazado', description: 'El post ha sido eliminado de la lista.' });
  };

  const handleOpenSchedule = (draft: PostDraft) => {
    setSelectedDraft(draft);
    setScheduleDialogOpen(true);
  };

  const handleSchedule = (scheduledAt: Date) => {
    if (selectedDraft) {
      setDrafts(prev => prev.map(d => 
        d.id === selectedDraft.id 
          ? { ...d, scheduledAt, updatedAt: new Date() } 
          : d
      ));
      toast({ 
        title: 'Post programado', 
        description: `Programado para ${format(scheduledAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}` 
      });
      setSelectedDraft(null);
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Aprobación de Posts"
        subtitle={`${counts.pending} pendientes de revisión`}
      />
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PostStatus | 'all')}>
          <TabsList className="mb-6 bg-surface border border-border p-1">
            {statusTabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 data-[state=active]:bg-background"
              >
                {tab.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {counts[tab.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-4">
              {filteredDrafts.map((draft, index) => (
                <Card 
                  key={draft.id} 
                  className="shadow-card hover:shadow-soft transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Platform & Status */}
                      <div className="flex flex-col items-center gap-2">
                        <PlatformBadge platform={draft.platform} showLabel={false} size="lg" />
                        <StatusBadge status={draft.status} size="sm" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                              {getNewsTitle(draft.newsItemId)}
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                              {draft.content}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                Ver detalle
                              </DropdownMenuItem>
                              {draft.status !== 'approved' && draft.status !== 'published' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleApprove(draft)}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                  Aprobar
                                </DropdownMenuItem>
                              )}
                              {draft.status === 'approved' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handlePublish(draft)}
                                >
                                  <Send className="h-4 w-4 text-primary" />
                                  Marcar como publicado
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleOpenSchedule(draft)}
                              >
                                <Calendar className="h-4 w-4" />
                                Calendarizar
                              </DropdownMenuItem>
                              {draft.status !== 'published' && (
                                <DropdownMenuItem 
                                  className="gap-2 text-destructive"
                                  onClick={() => handleReject(draft)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Rechazar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Actualizado {format(draft.updatedAt, "d MMM, HH:mm", { locale: es })}
                          </span>
                          {draft.scheduledAt && (
                            <span className="flex items-center gap-1 text-accent">
                              <Calendar className="h-3.5 w-3.5" />
                              Programado: {format(draft.scheduledAt, "d MMM, HH:mm", { locale: es })}
                            </span>
                          )}
                          <span>Variante {draft.variant}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      {draft.status === 'pending' && (
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            className="gap-1 bg-success hover:bg-success/90"
                            onClick={() => handleApprove(draft)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handleReview(draft)}
                          >
                            <Eye className="h-4 w-4" />
                            Revisar
                          </Button>
                        </div>
                      )}
                      
                      {draft.status === 'reviewed' && (
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            className="gap-1 bg-success hover:bg-success/90"
                            onClick={() => handleApprove(draft)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handleOpenSchedule(draft)}
                          >
                            <Calendar className="h-4 w-4" />
                            Programar
                          </Button>
                        </div>
                      )}
                      
                      {draft.status === 'approved' && (
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleOpenSchedule(draft)}
                          >
                            <Calendar className="h-4 w-4" />
                            Programar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handlePublish(draft)}
                          >
                            <Send className="h-4 w-4" />
                            Publicar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDrafts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay posts en este estado</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSchedule={handleSchedule}
        currentSchedule={selectedDraft?.scheduledAt}
      />
    </MainLayout>
  );
}
