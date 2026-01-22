import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewsItem } from '@/types/newsroom';
import { useNewsroom } from '@/context/NewsroomContext';

interface AddNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewsDialog({ open, onOpenChange }: AddNewsDialogProps) {
  const { addNewsItem, topics, sources } = useNewsroom();
  
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [editorialAngle, setEditorialAngle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setUrl('');
      setTitle('');
      setSource('');
      setSummary('');
      setKeyPoints('');
      setEditorialAngle('');
      setSelectedTopics([]);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newsData: Omit<NewsItem, 'id' | 'capturedAt' | 'score'> = {
      url: url.trim(),
      title: title.trim(),
      source: source,
      publishedAt: new Date(),
      summary: summary.trim(),
      keyPoints: keyPoints.split('\n').filter(Boolean).map(p => p.trim()),
      verificationRisks: [],
      editorialAngle: editorialAngle.trim(),
      topics: selectedTopics,
      entities: [],
      status: 'new',
    };
    
    addNewsItem(newsData);
    onOpenChange(false);
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) 
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Noticia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL de la noticia</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Fuente</Label>
              <Select value={source} onValueChange={setSource} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la noticia"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Resumen</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Resumen breve de la noticia..."
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keyPoints">Puntos Clave (uno por línea)</Label>
            <Textarea
              id="keyPoints"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="• Punto clave 1&#10;• Punto clave 2&#10;• Punto clave 3"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editorialAngle">Ángulo Editorial</Label>
            <Textarea
              id="editorialAngle"
              value={editorialAngle}
              onChange={(e) => setEditorialAngle(e.target.value)}
              placeholder="Perspectiva o enfoque editorial..."
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Topics</Label>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <Button
                  key={topic.id}
                  type="button"
                  variant={selectedTopics.includes(topic.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTopic(topic.name)}
                >
                  {topic.name}
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Añadir Noticia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
