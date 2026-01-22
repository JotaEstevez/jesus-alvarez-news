import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Entity } from '@/types/newsroom';

interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: Entity | null;
  onSave: (entity: Omit<Entity, 'id'> & { id?: string }) => void;
}

export function EntityDialog({ open, onOpenChange, entity, onSave }: EntityDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'person' | 'company' | 'organization' | 'location'>('company');
  const [aliases, setAliases] = useState('');

  useEffect(() => {
    if (entity) {
      setName(entity.name);
      setType(entity.type);
      setAliases(entity.aliases.join(', '));
    } else {
      setName('');
      setType('company');
      setAliases('');
    }
  }, [entity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: entity?.id,
      name: name.trim(),
      type,
      aliases: aliases.split(',').map(a => a.trim()).filter(Boolean)
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entity ? 'Editar Entidad' : 'Añadir Entidad'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: OpenAI"
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
                <SelectItem value="person">Persona</SelectItem>
                <SelectItem value="company">Empresa</SelectItem>
                <SelectItem value="organization">Organización</SelectItem>
                <SelectItem value="location">Ubicación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aliases">Aliases (separados por coma)</Label>
            <Input
              id="aliases"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="Ej: ChatGPT, GPT"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {entity ? 'Guardar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
