import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNewsroom } from '@/context/NewsroomContext';
import { Topic, Entity, Source, Keyword } from '@/types/newsroom';
import { TopicDialog } from '@/components/settings/TopicDialog';
import { EntityDialog } from '@/components/settings/EntityDialog';
import { SourceDialog } from '@/components/settings/SourceDialog';
import { KeywordDialog } from '@/components/settings/KeywordDialog';
import { DeleteConfirmDialog } from '@/components/settings/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Tag,
  Building2,
  Globe,
  Key,
  Sliders,
  RefreshCw
} from 'lucide-react';

export function SettingsPage() {
  const { toast } = useToast();
  const { 
    loading,
    topics, 
    entities, 
    sources, 
    keywords,
    saveTopic,
    deleteTopic,
    saveEntity,
    deleteEntity,
    saveSource,
    deleteSource,
    saveKeyword,
    deleteKeyword,
    reload
  } = useNewsroom();
  
  const [activeTab, setActiveTab] = useState('topics');
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [keywordDialogOpen, setKeywordDialogOpen] = useState(false);
  
  // Edit states
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  
  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    itemName: string;
    itemType: string;
    onConfirm: () => void;
  }>({ open: false, itemName: '', itemType: '', onConfirm: () => {} });

  // Topic handlers
  const handleSaveTopic = async (topicData: Omit<Topic, 'id'> & { id?: string }) => {
    setSaving(true);
    try {
      await saveTopic(topicData);
      toast({ 
        title: topicData.id ? 'Topic actualizado' : 'Topic añadido', 
        description: `"${topicData.name}" se ha ${topicData.id ? 'actualizado' : 'añadido'} correctamente.` 
      });
      setEditingTopic(null);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar el topic', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = (topic: Topic) => {
    setDeleteDialog({
      open: true,
      itemName: topic.name,
      itemType: 'topic',
      onConfirm: async () => {
        try {
          await deleteTopic(topic.id);
          toast({ title: 'Topic eliminado', description: `"${topic.name}" se ha eliminado.` });
        } catch (error) {
          toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Entity handlers
  const handleSaveEntity = async (entityData: Omit<Entity, 'id'> & { id?: string }) => {
    setSaving(true);
    try {
      await saveEntity(entityData);
      toast({ 
        title: entityData.id ? 'Entidad actualizada' : 'Entidad añadida', 
        description: `"${entityData.name}" se ha ${entityData.id ? 'actualizado' : 'añadido'} correctamente.` 
      });
      setEditingEntity(null);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la entidad', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntity = (entity: Entity) => {
    setDeleteDialog({
      open: true,
      itemName: entity.name,
      itemType: 'entidad',
      onConfirm: async () => {
        try {
          await deleteEntity(entity.id);
          toast({ title: 'Entidad eliminada', description: `"${entity.name}" se ha eliminado.` });
        } catch (error) {
          toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Source handlers
  const handleSaveSource = async (sourceData: Omit<Source, 'id'> & { id?: string }) => {
    setSaving(true);
    try {
      await saveSource(sourceData);
      toast({ 
        title: sourceData.id ? 'Fuente actualizada' : 'Fuente añadida', 
        description: `"${sourceData.name}" se ha ${sourceData.id ? 'actualizado' : 'añadido'} correctamente.` 
      });
      setEditingSource(null);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la fuente', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSource = (source: Source) => {
    setDeleteDialog({
      open: true,
      itemName: source.name,
      itemType: 'fuente',
      onConfirm: async () => {
        try {
          await deleteSource(source.id);
          toast({ title: 'Fuente eliminada', description: `"${source.name}" se ha eliminado.` });
        } catch (error) {
          toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Keyword handlers
  const handleSaveKeyword = async (keywordData: Omit<Keyword, 'id'> & { id?: string }) => {
    setSaving(true);
    try {
      await saveKeyword(keywordData);
      toast({ 
        title: keywordData.id ? 'Keyword actualizada' : 'Keyword añadida', 
        description: `"${keywordData.term}" se ha ${keywordData.id ? 'actualizado' : 'añadido'} correctamente.` 
      });
      setEditingKeyword(null);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la keyword', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKeyword = (keyword: Keyword) => {
    setDeleteDialog({
      open: true,
      itemName: keyword.term,
      itemType: 'keyword',
      onConfirm: async () => {
        try {
          await deleteKeyword(keyword.id);
          toast({ title: 'Keyword eliminada', description: `"${keyword.term}" se ha eliminado.` });
        } catch (error) {
          toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const TableSkeleton = () => (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <PageHeader 
        title="Configuración"
        subtitle="Gestiona los parámetros del newsroom"
        actions={
          <Button variant="outline" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-surface border border-border p-1">
            <TabsTrigger value="topics" className="gap-2 data-[state=active]:bg-background">
              <Tag className="h-4 w-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="entities" className="gap-2 data-[state=active]:bg-background">
              <Building2 className="h-4 w-4" />
              Entidades
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-2 data-[state=active]:bg-background">
              <Globe className="h-4 w-4" />
              Fuentes
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2 data-[state=active]:bg-background">
              <Key className="h-4 w-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2 data-[state=active]:bg-background">
              <Sliders className="h-4 w-4" />
              Scoring
            </TabsTrigger>
          </TabsList>

          {/* Topics Tab */}
          <TabsContent value="topics">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Topics de Interés</CardTitle>
                  <CardDescription>Temas que el sistema debe monitorear y priorizar</CardDescription>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setEditingTopic(null);
                    setTopicDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Añadir Topic
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? <TableSkeleton /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay topics configurados. Añade el primero.
                          </TableCell>
                        </TableRow>
                      ) : topics.map(topic => (
                        <TableRow key={topic.id}>
                          <TableCell className="font-medium">{topic.name}</TableCell>
                          <TableCell className="text-muted-foreground">{topic.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">P{topic.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setEditingTopic(topic);
                                  setTopicDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDeleteTopic(topic)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Entidades Monitoreadas</CardTitle>
                  <CardDescription>Personas, empresas y organizaciones relevantes</CardDescription>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setEditingEntity(null);
                    setEntityDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Añadir Entidad
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? <TableSkeleton /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Aliases</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay entidades configuradas. Añade la primera.
                          </TableCell>
                        </TableRow>
                      ) : entities.map(entity => (
                        <TableRow key={entity.id}>
                          <TableCell className="font-medium">{entity.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entity.type}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entity.aliases.join(', ')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setEditingEntity(entity);
                                  setEntityDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDeleteEntity(entity)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Fuentes de Noticias</CardTitle>
                  <CardDescription>Medios y feeds monitoreados</CardDescription>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setEditingSource(null);
                    setSourceDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Añadir Fuente
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? <TableSkeleton /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Fiabilidad</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No hay fuentes configuradas. Añade la primera.
                          </TableCell>
                        </TableRow>
                      ) : sources.map(source => (
                        <TableRow key={source.id}>
                          <TableCell className="font-medium">{source.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{source.url}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{source.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-success rounded-full" 
                                  style={{ width: `${source.reliability}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{source.reliability}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setEditingSource(source);
                                  setSourceDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDeleteSource(source)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Keywords de Scoring</CardTitle>
                  <CardDescription>Palabras clave que afectan la puntuación de noticias</CardDescription>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setEditingKeyword(null);
                    setKeywordDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Añadir Keyword
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? <TableSkeleton /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Término</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay keywords configuradas. Añade la primera.
                          </TableCell>
                        </TableRow>
                      ) : keywords.map(keyword => (
                        <TableRow key={keyword.id}>
                          <TableCell className="font-medium">{keyword.term}</TableCell>
                          <TableCell>
                            <Badge variant={keyword.type === 'impact' ? 'default' : 'destructive'}>
                              {keyword.type === 'impact' ? 'Impacto' : 'Negativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={keyword.weight > 0 ? 'text-success' : 'text-destructive'}>
                              {keyword.weight > 0 ? '+' : ''}{keyword.weight}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setEditingKeyword(keyword);
                                  setKeywordDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDeleteKeyword(keyword)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring">
            <div className="grid gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base">Configuración de Scoring</CardTitle>
                  <CardDescription>Ajusta cómo se calculan las puntuaciones de las noticias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Puntuación base</Label>
                      <p className="text-sm text-muted-foreground">Todas las noticias empiezan con 50 puntos</p>
                    </div>
                    <Badge variant="secondary">50 pts</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bonus por fuente fiable</Label>
                      <p className="text-sm text-muted-foreground">+15 puntos si la fuente tiene &gt;85% fiabilidad</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Multiplicador de prioridad de topic</Label>
                      <p className="text-sm text-muted-foreground">Topics P1 suman más puntos que P5</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Penalización por keywords negativas</Label>
                      <p className="text-sm text-muted-foreground">Resta puntos cuando detecta términos negativos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base">Fórmula de Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
                    <p className="text-muted-foreground mb-2">// Cálculo automático</p>
                    <p>score = 50 <span className="text-muted-foreground">// base</span></p>
                    <p className="mt-1">+ Σ(keyword.weight) <span className="text-muted-foreground">// keywords detectadas</span></p>
                    <p className="mt-1">+ Σ((5 - topic.priority) * 5) <span className="text-muted-foreground">// bonus por topic</span></p>
                    <p className="mt-1">+ (source.reliability &gt; 85 ? 15 : 0) <span className="text-muted-foreground">// bonus fuente</span></p>
                    <p className="mt-3 text-muted-foreground">// Resultado entre 0-100</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <TopicDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        topic={editingTopic}
        onSave={handleSaveTopic}
      />
      
      <EntityDialog
        open={entityDialogOpen}
        onOpenChange={setEntityDialogOpen}
        entity={editingEntity}
        onSave={handleSaveEntity}
      />
      
      <SourceDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        source={editingSource}
        onSave={handleSaveSource}
      />
      
      <KeywordDialog
        open={keywordDialogOpen}
        onOpenChange={setKeywordDialogOpen}
        keyword={editingKeyword}
        onSave={handleSaveKeyword}
      />
      
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        itemName={deleteDialog.itemName}
        itemType={deleteDialog.itemType}
        onConfirm={deleteDialog.onConfirm}
      />
    </MainLayout>
  );
}
