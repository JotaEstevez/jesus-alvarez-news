import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Source } from '@/types/newsroom';

interface SourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: Source | null;
  onSave: (source: Omit<Source, 'id'> & { id?: string }) => void;
}

export function SourceDialog({ open, onOpenChange, source, onSave }: SourceDialogProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [reliability, setReliability] = useState(80);

  useEffect(() => {
    if (source) {
      setName(source.name);
      setUrl(source.url);
      setCategory(source.category);
      setReliability(source.reliability);
    } else {
      setName('');
      setUrl('');
      setCategory('');
      setReliability(80);
    }
  }, [source, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: source?.id,
      name: name.trim(),
      url: url.trim(),
      category: category.trim(),
      reliability
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{source ? 'Editar Fuente' : 'Añadir Fuente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: El País"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Nacional, Internacional, Tecnología"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Fiabilidad: {reliability}%</Label>
            <Slider
              value={[reliability]}
              onValueChange={(v) => setReliability(v[0])}
              min={0}
              max={100}
              step={5}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {source ? 'Guardar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
