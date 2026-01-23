import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNewsroom } from '@/context/NewsroomContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Platform } from '@/types/newsroom';
import { 
  generateScheduleSuggestions, 
  getVariantInfo, 
  getRecommendedVariant,
  evaluateCharacterCount,
  variantDefinitions,
  ScheduleSlot
} from '@/lib/scheduling';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  Facebook,
  Loader2,
  Star,
  Calendar,
  Clock,
  MessageSquare
} from 'lucide-react';

const platforms: Platform[] = ['linkedin', 'twitter', 'facebook'];

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
  const { 
    getNewsById, 
    getDraftsForNews, 
    updateDraft, 
    updateDraftStatus, 
    getReadyNews, 
    addDraft,
    scheduleDraft,
    addCalendarEvent
  } = useNewsroom();
  
  const newsItem = newsId ? getNewsById(newsId) : null;
  const readyNews = getReadyNews();
  
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linkedin');
  const [selectedVariant, setSelectedVariant] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingPlatforms, setGeneratingPlatforms] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localContent, setLocalContent] = useState<Record<string, string>>({});
  const [showSchedule, setShowSchedule] = useState(false);

  // Get drafts for this news item
  const drafts = newsId ? getDraftsForNews(newsId) : [];

  // Generate schedule suggestions
  const scheduleSuggestions = useMemo(() => {
    if (!newsItem) return [];
    return generateScheduleSuggestions(newsItem.title, platforms);
  }, [newsItem]);

  const generateSinglePost = async (platform: Platform, variant: number): Promise<string | null> => {
    if (!newsItem) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          newsTitle: newsItem.title,
          newsSummary: newsItem.summary,
          newsUrl: newsItem.url,
          newsSource: newsItem.source,
          topics: newsItem.topics,
          platform,
          variant,
        },
      });

      if (error) {
        console.error('Error generating post:', error);
        throw error;
      }

      return data.content;
    } catch (error: any) {
      console.error('Generate post error:', error);
      
      if (error.message?.includes('429') || error.message?.includes('Demasiadas')) {
        toast({
          title: 'Límite de solicitudes',
          description: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
          variant: 'destructive',
        });
      } else if (error.message?.includes('402') || error.message?.includes('Créditos')) {
        toast({
          title: 'Créditos agotados',
          description: 'Añade créditos a tu workspace para continuar.',
          variant: 'destructive',
        });
      }
      
      return null;
    }
  };

  const handleGenerateAll = async () => {
    if (!newsId || !newsItem) return;
    
    setIsGenerating(true);
    toast({ title: 'Generando posts...', description: 'Creando 3 variantes por red (9 posts totales).' });
    
    let successCount = 0;
    
    for (const platform of platforms) {
      for (const variant of [1, 2, 3]) {
        const key = `${platform}-${variant}`;
        setGeneratingPlatforms(prev => new Set(prev).add(key));
        
        const content = await generateSinglePost(platform, variant);
        
        if (content) {
          setLocalContent(prev => ({ ...prev, [key]: content }));
          
          const existingDraft = drafts.find(d => d.platform === platform && d.variant === variant);
          if (existingDraft) {
            updateDraft(existingDraft.id, { content });
          } else {
            addDraft({
              newsItemId: newsId,
              platform,
              variant,
              content,
              status: 'pending',
            });
          }
          successCount++;
        }
        
        setGeneratingPlatforms(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }
    
    setIsGenerating(false);
    setShowSchedule(true);
    toast({ 
      title: 'Posts generados', 
      description: `${successCount} borradores creados con IA. Revisa el calendario sugerido.` 
    });
  };

  const handleGenerateSingle = async (platform: Platform, variant: number) => {
    if (!newsId || !newsItem) return;
    
    const key = `${platform}-${variant}`;
    setGeneratingPlatforms(prev => new Set(prev).add(key));
    
    const content = await generateSinglePost(platform, variant);
    
    if (content) {
      setLocalContent(prev => ({ ...prev, [key]: content }));
      
      const existingDraft = drafts.find(d => d.platform === platform && d.variant === variant);
      if (existingDraft) {
        updateDraft(existingDraft.id, { content });
      } else {
        addDraft({
          newsItemId: newsId,
          platform,
          variant,
          content,
          status: 'pending',
        });
      }
      
      toast({ title: 'Post regenerado' });
    }
    
    setGeneratingPlatforms(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
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
    
    return '';
  };

  const handleContentChange = (platform: Platform, variant: number, content: string) => {
    const key = `${platform}-${variant}`;
    setLocalContent(prev => ({ ...prev, [key]: content }));
    
    const draft = drafts.find(d => d.platform === platform && d.variant === variant);
    if (draft) {
      updateDraft(draft.id, { content });
    }
  };

  const handleScheduleRecommended = () => {
    if (!newsId) return;
    
    scheduleSuggestions.forEach((slot) => {
      const recommendedVariant = getRecommendedVariant(slot.platform);
      const draft = drafts.find(d => d.platform === slot.platform && d.variant === recommendedVariant);
      
      if (draft) {
        scheduleDraft(draft.id, slot.date);
        addCalendarEvent({
          postId: draft.id,
          platform: slot.platform,
          scheduledAt: slot.date,
          title: newsItem?.title.substring(0, 30) + '...' || 'Post',
          status: 'approved',
        });
      }
    });
    
    toast({
      title: 'Calendario programado',
      description: `${scheduleSuggestions.length} posts programados con las variantes recomendadas.`,
    });
    navigate('/calendar');
  };

  const handleSendToApproval = (platform: Platform, variant: number) => {
    const draft = drafts.find(d => d.platform === platform && d.variant === variant);
    if (draft) {
      updateDraftStatus(draft.id, 'pending');
      toast({ 
        title: 'Enviado a aprobación',
        description: `Borrador de ${platform === 'twitter' ? 'X' : platform} (V${variant}) enviado.`
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
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Generando...' : 'Generar Todo (9 posts)'}
            </Button>
            {drafts.length > 0 && (
              <Button onClick={handleSendAllToApproval} variant="outline" className="gap-2">
                <Send className="h-4 w-4" />
                Enviar a Aprobación
              </Button>
            )}
          </div>
        }
      />
      
      <div className="p-6 space-y-6">
        {/* Calendario de Publicación Sugerido */}
        {(showSchedule || drafts.length > 0) && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5 text-accent" />
                  Calendario de Publicación Sugerido
                </CardTitle>
                <Button 
                  onClick={handleScheduleRecommended}
                  className="gap-2"
                  disabled={drafts.length === 0}
                >
                  <Clock className="h-4 w-4" />
                  Programar Recomendados
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Red</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Día</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Justificación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleSuggestions.map((slot, index) => {
                    const recommendedVariant = getRecommendedVariant(slot.platform);
                    const variantInfo = getVariantInfo(recommendedVariant, slot.platform);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <PlatformBadge platform={slot.platform} size="sm" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {variantInfo.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {format(slot.date, "EEEE d 'de' MMMM", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{slot.time}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                          {slot.justification}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tabs por Plataforma */}
        <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
          <TabsList className="mb-6 bg-surface border border-border p-1">
            {platforms.map(platform => {
              const Icon = platformIcons[platform];
              const platformDrafts = drafts.filter(d => d.platform === platform);
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
                  {platformDrafts.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {platformDrafts.length}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {platforms.map(platform => (
            <TabsContent key={platform} value={platform} className="mt-0">
              <Accordion type="single" defaultValue="variant-1" className="space-y-4">
                {variantDefinitions.map((variantDef) => {
                  const key = `${platform}-${variantDef.variant}`;
                  const isGeneratingThis = generatingPlatforms.has(key);
                  const content = getDraftContent(platform, variantDef.variant);
                  const variantInfo = getVariantInfo(variantDef.variant, platform);
                  const charEval = evaluateCharacterCount(content, platform);
                  
                  return (
                    <AccordionItem 
                      key={variantDef.variant} 
                      value={`variant-${variantDef.variant}`}
                      className="border rounded-lg bg-card shadow-card"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex items-center gap-2">
                            {variantInfo.isRecommended && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <span className="font-semibold">{variantDef.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {variantDef.description}
                          </span>
                          {variantInfo.isRecommended && (
                            <Badge className="ml-auto mr-4 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                              Recomendada
                            </Badge>
                          )}
                          {content && (
                            <Badge 
                              variant="outline" 
                              className={`mr-4 ${
                                charEval.status === 'ok' 
                                  ? 'text-green-600 border-green-300' 
                                  : charEval.status === 'short'
                                    ? 'text-orange-600 border-orange-300'
                                    : 'text-red-600 border-red-300'
                              }`}
                            >
                              {charEval.message}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {/* Toolbar */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(content, key)}
                                className="gap-1"
                                disabled={!content}
                              >
                                {copiedId === key ? (
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
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateSingle(platform, variantDef.variant)}
                                disabled={isGeneratingThis || isGenerating}
                                className="gap-1"
                              >
                                {isGeneratingThis ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                                Regenerar
                              </Button>
                            </div>
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleSendToApproval(platform, variantDef.variant)}
                              disabled={!content}
                            >
                              <Send className="h-4 w-4" />
                              Enviar a Aprobación
                            </Button>
                          </div>
                          
                          {/* Content */}
                          {isGeneratingThis ? (
                            <div className="min-h-[200px] flex items-center justify-center bg-muted/50 rounded-md">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
                                <p className="text-sm text-muted-foreground mt-2">Generando {variantDef.name}...</p>
                              </div>
                            </div>
                          ) : (
                            <Textarea
                              value={content}
                              onChange={(e) => handleContentChange(platform, variantDef.variant, e.target.value)}
                              className="min-h-[200px] resize-none font-mono text-sm"
                              placeholder={`Haz clic en "Generar Todo" o "Regenerar" para crear ${variantDef.name}`}
                            />
                          )}
                          
                          {/* Alternative closing question */}
                          {variantInfo.alternativeClosingQuestion && content && (
                            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Pregunta alternativa de cierre:</p>
                                <p className="text-sm italic">"{variantInfo.alternativeClosingQuestion}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>

        {/* Reglas Editoriales */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm text-foreground mb-2">📝 Reglas Editoriales Aplicadas</h4>
            <ul className="text-xs text-muted-foreground space-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <li>• <strong>Plantilla:</strong> Gancho → Contexto → 3 Claves → Cierre</li>
              <li>• <strong>Tono:</strong> Opinión suave, criterio y matices</li>
              <li>• <strong>LinkedIn:</strong> 900-1.400 caracteres, reflexivo</li>
              <li>• <strong>X:</strong> 180-280 caracteres, 1 idea + dato</li>
              <li>• <strong>Facebook:</strong> 300-700 caracteres, narrativo</li>
              <li>• <strong>Hashtags:</strong> Máximo 2-4 relevantes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
