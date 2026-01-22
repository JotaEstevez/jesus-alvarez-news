import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Topic } from '@/types/newsroom';

interface TopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic?: Topic | null;
  onSave: (topic: Omit<Topic, 'id'> & { id?: string }) => void;
}

export function TopicDialog({ open, onOpenChange, topic, onSave }: TopicDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description);
      setPriority(topic.priority);
    } else {
      setName('');
      setDescription('');
      setPriority(1);
    }
  }, [topic, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: topic?.id,
      name: name.trim(),
      description: description.trim(),
      priority
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{topic ? 'Editar Topic' : 'Añadir Topic'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Economía Digital"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del topic"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad (1-10)</Label>
            <Input
              id="priority"
              type="number"
              min={1}
              max={10}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {topic ? 'Guardar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
