import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScoreIndicator } from '@/components/ui/score-indicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNewsroom } from '@/context/NewsroomContext';
import { AddNewsDialog } from '@/components/inbox/AddNewsDialog';
import { DeleteConfirmDialog } from '@/components/settings/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function InboxPage() {
  const { toast } = useToast();
  const { newsItems, topics, sources, deleteNewsItem, markNewsAsReady } = useNewsroom();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: '', title: ''
  });

  const filteredNews = newsItems.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (scoreFilter === 'high' && item.score < 70) return false;
    if (scoreFilter === 'medium' && (item.score < 40 || item.score >= 70)) return false;
    if (scoreFilter === 'low' && item.score >= 40) return false;
    if (topicFilter !== 'all' && !item.topics.includes(topicFilter)) return false;
    if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    setDeleteDialog({ open: true, id, title });
  };

  const confirmDelete = async () => {
    try {
      await deleteNewsItem(deleteDialog.id);
      toast({ title: 'Noticia eliminada' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
    setDeleteDialog({ open: false, id: '', title: '' });
  };

  const handleMarkReady = async (id: string, title: string) => {
    try {
      await markNewsAsReady(id);
      toast({ 
        title: 'Noticia lista para generar', 
        description: `"${title.substring(0, 50)}..." está lista para crear posts.` 
      });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Inbox de Noticias"
        subtitle={`${filteredNews.length} noticias capturadas`}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                toast({ 
                  title: 'Inbox actualizado', 
                  description: `${newsItems.length} noticias en el sistema.` 
                });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Añadir Noticia
            </Button>
          </div>
        }
      />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-surface rounded-xl border border-border shadow-card">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar noticias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="high">Alto (70+)</SelectItem>
              <SelectItem value="medium">Medio (40-69)</SelectItem>
              <SelectItem value="low">Bajo (&lt;40)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los temas</SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic.id} value={topic.name}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              {sources.map(source => (
                <SelectItem key={source.id} value={source.name}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* News List */}
        <div className="space-y-3">
          {filteredNews.map((item, index) => (
            <article
              key={item.id}
              className="group bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-soft transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Score */}
                <div className="flex-shrink-0 pt-1">
                  <ScoreIndicator score={item.score} size="lg" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">{item.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(item.capturedAt, "d MMM, HH:mm", { locale: es })}
                        </span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Ver original
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.status !== 'ready' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleMarkReady(item.id, item.title)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Marcar lista
                        </Button>
                      )}
                      <Link to={`/news/${item.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Ver detalle
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/generator/${item.id}`}>
                        <Button size="sm" className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
                          <Sparkles className="h-4 w-4" />
                          Generar
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDelete(item.id, item.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {item.topics.map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {item.entities.map(entity => (
                      <Badge key={entity} variant="outline" className="text-xs">
                        {entity}
                      </Badge>
                    ))}
                    {item.status === 'new' && (
                      <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                        Nueva
                      </Badge>
                    )}
                    {item.status === 'ready' && (
                      <Badge className="bg-success/10 text-success border-success/20 text-xs">
                        Lista
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}

          {filteredNews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay noticias que coincidan con los filtros</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir primera noticia
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddNewsDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        itemName={deleteDialog.title.substring(0, 50) + '...'}
        itemType="noticia"
        onConfirm={confirmDelete}
      />
    </MainLayout>
  );
}
