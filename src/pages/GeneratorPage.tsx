import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNewsroom } from '@/context/NewsroomContext';
import { useToast } from '@/hooks/use-toast';
import { Platform } from '@/types/newsroom';
import { 
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';

const platforms: Platform[] = ['linkedin', 'twitter', 'instagram', 'facebook'];

const platformIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
};

export function GeneratorPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { newsId } = useParams<{ newsId: string }>();
  const { getNewsById, getDraftsForNews, generateDraftsForNews, updateDraft, updateDraftStatus, getReadyNews } = useNewsroom();
  
  const newsItem = newsId ? getNewsById(newsId) : null;
  const readyNews = getReadyNews();
  
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linkedin');
  const [selectedVariant, setSelectedVariant] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localContent, setLocalContent] = useState<Record<string, string>>({});

  // Get drafts for this news item
  const drafts = newsId ? getDraftsForNews(newsId) : [];

  const handleGenerate = () => {
    if (!newsId) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      generateDraftsForNews(newsId);
      setIsGenerating(false);
      toast({ title: 'Posts generados', description: '8 borradores creados (2 por plataforma)' });
    }, 1500);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDraftContent = (platform: Platform, variant: number) => {
    const key = `${platform}-${variant}`;
    if (localContent[key] !== undefined) return localContent[key];
    
    const draft = drafts.find(d => d.platform === platform && d.variant === variant);
    if (draft) return draft.content;
    
    // Default content for platforms without drafts
    const defaultContent: Record<Platform, string> = {
      linkedin: `📊 [Título del post para LinkedIn]\n\nContenido profesional y detallado...\n\n#Hashtags #Relevantes`,
      twitter: `🧵 [Hilo para X]\n\n→ Punto 1\n→ Punto 2\n→ Punto 3\n\n¿Qué opinas?`,
      instagram: `✨ [Caption para Instagram]\n\nContenido visual y atractivo...\n\n.\n.\n.\n#hashtags`,
      facebook: `[Post para Facebook]\n\nContenido cercano y conversacional...\n\n👉 Call to action`,
    };
    return defaultContent[platform];
  };

  const handleContentChange = (platform: Platform, variant: number, content: string) => {
    const key = `${platform}-${variant}`;
    setLocalContent(prev => ({ ...prev, [key]: content }));
    
    // Update draft if it exists
    const draft = drafts.find(d => d.platform === platform && d.variant === variant);
    if (draft) {
      updateDraft(draft.id, { content });
    }
  };

  const handleSendToApproval = (platform: Platform, variant: number) => {
    const draft = drafts.find(d => d.platform === platform && d.variant === variant);
    if (draft) {
      updateDraftStatus(draft.id, 'pending');
      toast({ 
        title: 'Enviado a aprobación',
        description: `Borrador de ${platform === 'twitter' ? 'X' : platform} enviado para revisión.`
      });
    } else {
      toast({ 
        title: 'Genera primero',
        description: 'Debes generar los borradores antes de enviarlos.',
        variant: 'destructive'
      });
    }
  };

  const handleSendAllToApproval = () => {
    drafts.forEach(draft => {
      updateDraftStatus(draft.id, 'pending');
    });
    toast({ 
      title: 'Todos enviados a aprobación',
      description: `${drafts.length} borradores enviados para revisión.`
    });
    navigate('/approval');
  };

  if (!newsId) {
    // Show list of ready news
    return (
      <MainLayout>
        <PageHeader 
          title="Generador de Posts"
          subtitle="Selecciona una noticia para generar posts"
        />
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Noticias listas para generar ({readyNews.length})</h2>
          {readyNews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay noticias marcadas como listas.</p>
              <Link to="/inbox">
                <Button variant="outline" className="mt-4">
                  Ir al Inbox
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {readyNews.map(news => (
                <Card key={news.id} className="shadow-card hover:shadow-soft transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{news.title}</p>
                      <p className="text-sm text-muted-foreground">{news.source}</p>
                    </div>
                    <Link to={`/generator/${news.id}`}>
                      <Button className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generar Posts
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Generador de Posts"
        subtitle={newsItem?.title}
        actions={
          <div className="flex items-center gap-3">
            <Link to="/inbox">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Generando...' : drafts.length > 0 ? 'Regenerar Todo' : 'Generar Posts'}
            </Button>
            {drafts.length > 0 && (
              <Button onClick={handleSendAllToApproval} className="gap-2">
                <Send className="h-4 w-4" />
                Enviar Todos a Aprobación
              </Button>
            )}
          </div>
        }
      />
      
      <div className="p-6">
        {/* Platform Tabs */}
        <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
          <TabsList className="mb-6 bg-surface border border-border p-1">
            {platforms.map(platform => {
              const Icon = platformIcons[platform];
              const hasDrafts = drafts.some(d => d.platform === platform);
              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className="gap-2 data-[state=active]:bg-background"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                  {hasDrafts && (
                    <span className="w-2 h-2 rounded-full bg-success" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {platforms.map(platform => (
            <TabsContent key={platform} value={platform} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map(variant => (
                  <Card 
                    key={variant} 
                    className={`shadow-card transition-all duration-200 ${
                      selectedVariant === variant 
                        ? 'ring-2 ring-accent shadow-soft' 
                        : 'hover:shadow-soft'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <PlatformBadge platform={platform} size="sm" />
                          <span className="text-muted-foreground">Variante {variant}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(getDraftContent(platform, variant), `${platform}-${variant}`)}
                            className="gap-1"
                          >
                            {copiedId === `${platform}-${variant}` ? (
                              <>
                                <Check className="h-4 w-4 text-success" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copiar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                          >
                            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={getDraftContent(platform, variant)}
                        onChange={(e) => handleContentChange(platform, variant, e.target.value)}
                        className="min-h-[200px] resize-none font-mono text-sm"
                        onClick={() => setSelectedVariant(variant)}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {getDraftContent(platform, variant).length} caracteres
                        </span>
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleSendToApproval(platform, variant)}
                        >
                          <Send className="h-4 w-4" />
                          Enviar a Aprobación
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Editorial Guidelines */}
        <Card className="mt-6 bg-muted/50 border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm text-foreground mb-2">📝 Reglas Editoriales</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• No copiar texto literal de noticias. Resumir y aportar criterio propio.</li>
              <li>• Tono: profesional, cercano y con criterio (human premium).</li>
              <li>• Siempre enlazar a la fuente original.</li>
              <li>• Generar empatía y confianza con la audiencia.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
