import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Keyword } from '@/types/newsroom';

interface KeywordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword?: Keyword | null;
  onSave: (keyword: Omit<Keyword, 'id'> & { id?: string }) => void;
}

export function KeywordDialog({ open, onOpenChange, keyword, onSave }: KeywordDialogProps) {
  const [term, setTerm] = useState('');
  const [type, setType] = useState<'impact' | 'negative'>('impact');
  const [weight, setWeight] = useState(5);

  useEffect(() => {
    if (keyword) {
      setTerm(keyword.term);
      setType(keyword.type);
      setWeight(Math.abs(keyword.weight));
    } else {
      setTerm('');
      setType('impact');
      setWeight(5);
    }
  }, [keyword, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = type === 'negative' ? -Math.abs(weight) : Math.abs(weight);
    onSave({
      id: keyword?.id,
      term: term.trim(),
      type,
      weight: finalWeight
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{keyword ? 'Editar Keyword' : 'Añadir Keyword'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="term">Término</Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ej: inteligencia artificial"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impact">Impacto (+)</SelectItem>
                <SelectItem value="negative">Negativa (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (1-10)</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {keyword ? 'Guardar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
