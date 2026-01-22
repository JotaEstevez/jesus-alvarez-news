import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockNewsItems, mockDrafts } from '@/data/mockData';
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
  const { newsId } = useParams<{ newsId: string }>();
  const newsItem = mockNewsItems.find(item => item.id === newsId);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linkedin');
  const [selectedVariant, setSelectedVariant] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get drafts for this news item or use mock content
  const drafts = newsId 
    ? mockDrafts.filter(d => d.newsItemId === newsId)
    : mockDrafts;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDraftContent = (platform: Platform, variant: number) => {
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

  return (
    <MainLayout>
      <PageHeader 
        title="Generador de Posts"
        subtitle={newsItem?.title}
        actions={
          <div className="flex items-center gap-3">
            <Link to={newsId ? `/news/${newsId}` : '/inbox'}>
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
              {isGenerating ? 'Generando...' : 'Regenerar Todo'}
            </Button>
          </div>
        }
      />
      
      <div className="p-6">
        {/* Platform Tabs */}
        <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
          <TabsList className="mb-6 bg-surface border border-border p-1">
            {platforms.map(platform => {
              const Icon = platformIcons[platform];
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
                        onChange={() => {}}
                        className="min-h-[200px] resize-none font-mono text-sm"
                        onClick={() => setSelectedVariant(variant)}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {getDraftContent(platform, variant).length} caracteres
                        </span>
                        <Button size="sm" className="gap-2">
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
