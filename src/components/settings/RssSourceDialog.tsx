import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RssSource } from '@/types/newsroom';

interface RssSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rssSource?: RssSource | null;
  onSave: (source: Omit<RssSource, 'id'> & { id?: string }) => void;
}

export function RssSourceDialog({ open, onOpenChange, rssSource, onSave }: RssSourceDialogProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (rssSource) {
      setName(rssSource.name);
      setUrl(rssSource.url);
      setCategory(rssSource.category || '');
      setIsActive(rssSource.isActive);
    } else if (open) {
      setName('');
      setUrl('');
      setCategory('');
      setIsActive(true);
    }
  }, [rssSource, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    const trimmedCategory = category.trim();
    
    if (!trimmedName || !trimmedUrl) return;
    
    onSave({
      id: rssSource?.id,
      name: trimmedName,
      url: trimmedUrl,
      category: trimmedCategory || undefined,
      isActive,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{rssSource ? 'Editar' : 'Añadir'} Fuente RSS</DialogTitle>
            <DialogDescription>
              Configura una fuente RSS para importar noticias automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: ESPN Fútbol"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL del Feed RSS</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/rss.xml"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría / Deporte (opcional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Fútbol, Baloncesto, F1..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Activa</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || !url.trim()}>
              {rssSource ? 'Guardar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
