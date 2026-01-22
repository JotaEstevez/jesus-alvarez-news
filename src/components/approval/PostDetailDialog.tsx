import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { PostDraft } from '@/types/newsroom';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle2, Eye, Calendar, Send } from 'lucide-react';

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: PostDraft | null;
  newsTitle?: string;
  onReview?: (draftId: string) => void;
  onApprove?: (draftId: string) => void;
  onPublish?: (draftId: string) => void;
  onSchedule?: (draftId: string) => void;
}

export function PostDetailDialog({
  open,
  onOpenChange,
  draft,
  newsTitle,
  onReview,
  onApprove,
  onPublish,
  onSchedule,
}: PostDetailDialogProps) {
  const { toast } = useToast();

  if (!draft) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);
      toast({
        title: 'Copiado al portapapeles',
        description: 'El contenido del post ha sido copiado.',
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <PlatformBadge platform={draft.platform} />
            <span>Detalle del Post</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* News Title */}
          {newsTitle && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Noticia origen</p>
              <p className="font-medium">{newsTitle}</p>
            </div>
          )}

          {/* Status & Variant */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estado</p>
              <StatusBadge status={draft.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Variante</p>
              <p className="font-medium">#{draft.variant}</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Contenido del post</p>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto border">
              {draft.content}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {draft.status === 'pending' && onReview && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  onReview(draft.id);
                  onOpenChange(false);
                }}
              >
                <Eye className="h-4 w-4" />
                Marcar Revisado
              </Button>
            )}

            {draft.status !== 'approved' && draft.status !== 'published' && onApprove && (
              <Button
                size="sm"
                className="gap-2 bg-success hover:bg-success/90"
                onClick={() => {
                  onApprove(draft.id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprobar
              </Button>
            )}

            {draft.status !== 'published' && onSchedule && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  onSchedule(draft.id);
                  onOpenChange(false);
                }}
              >
                <Calendar className="h-4 w-4" />
                Programar
              </Button>
            )}

            {draft.status === 'approved' && onPublish && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  onPublish(draft.id);
                  onOpenChange(false);
                }}
              >
                <Send className="h-4 w-4" />
                Marcar Publicado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
