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
import { mockTopics, mockEntities, mockSources, mockKeywords } from '@/data/mockData';
import { Topic, Entity, Source, Keyword } from '@/types/newsroom';
import { TopicDialog } from '@/components/settings/TopicDialog';
import { EntityDialog } from '@/components/settings/EntityDialog';
import { SourceDialog } from '@/components/settings/SourceDialog';
import { KeywordDialog } from '@/components/settings/KeywordDialog';
import { DeleteConfirmDialog } from '@/components/settings/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Tag,
  Building2,
  Globe,
  Key,
  Sliders
} from 'lucide-react';

export function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('topics');
  
  // State for data
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [entities, setEntities] = useState<Entity[]>(mockEntities);
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  
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
  const handleSaveTopic = (topicData: Omit<Topic, 'id'> & { id?: string }) => {
    if (topicData.id) {
      setTopics(prev => prev.map(t => t.id === topicData.id ? { ...topicData, id: topicData.id } as Topic : t));
      toast({ title: 'Topic actualizado', description: `"${topicData.name}" se ha actualizado correctamente.` });
    } else {
      const newTopic: Topic = { ...topicData, id: crypto.randomUUID() };
      setTopics(prev => [...prev, newTopic]);
      toast({ title: 'Topic añadido', description: `"${topicData.name}" se ha añadido correctamente.` });
    }
    setEditingTopic(null);
  };

  const handleDeleteTopic = (topic: Topic) => {
    setDeleteDialog({
      open: true,
      itemName: topic.name,
      itemType: 'topic',
      onConfirm: () => {
        setTopics(prev => prev.filter(t => t.id !== topic.id));
        toast({ title: 'Topic eliminado', description: `"${topic.name}" se ha eliminado.` });
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Entity handlers
  const handleSaveEntity = (entityData: Omit<Entity, 'id'> & { id?: string }) => {
    if (entityData.id) {
      setEntities(prev => prev.map(e => e.id === entityData.id ? { ...entityData, id: entityData.id } as Entity : e));
      toast({ title: 'Entidad actualizada', description: `"${entityData.name}" se ha actualizado correctamente.` });
    } else {
      const newEntity: Entity = { ...entityData, id: crypto.randomUUID() };
      setEntities(prev => [...prev, newEntity]);
      toast({ title: 'Entidad añadida', description: `"${entityData.name}" se ha añadido correctamente.` });
    }
    setEditingEntity(null);
  };

  const handleDeleteEntity = (entity: Entity) => {
    setDeleteDialog({
      open: true,
      itemName: entity.name,
      itemType: 'entidad',
      onConfirm: () => {
        setEntities(prev => prev.filter(e => e.id !== entity.id));
        toast({ title: 'Entidad eliminada', description: `"${entity.name}" se ha eliminado.` });
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Source handlers
  const handleSaveSource = (sourceData: Omit<Source, 'id'> & { id?: string }) => {
    if (sourceData.id) {
      setSources(prev => prev.map(s => s.id === sourceData.id ? { ...sourceData, id: sourceData.id } as Source : s));
      toast({ title: 'Fuente actualizada', description: `"${sourceData.name}" se ha actualizado correctamente.` });
    } else {
      const newSource: Source = { ...sourceData, id: crypto.randomUUID() };
      setSources(prev => [...prev, newSource]);
      toast({ title: 'Fuente añadida', description: `"${sourceData.name}" se ha añadido correctamente.` });
    }
    setEditingSource(null);
  };

  const handleDeleteSource = (source: Source) => {
    setDeleteDialog({
      open: true,
      itemName: source.name,
      itemType: 'fuente',
      onConfirm: () => {
        setSources(prev => prev.filter(s => s.id !== source.id));
        toast({ title: 'Fuente eliminada', description: `"${source.name}" se ha eliminado.` });
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // Keyword handlers
  const handleSaveKeyword = (keywordData: Omit<Keyword, 'id'> & { id?: string }) => {
    if (keywordData.id) {
      setKeywords(prev => prev.map(k => k.id === keywordData.id ? { ...keywordData, id: keywordData.id } as Keyword : k));
      toast({ title: 'Keyword actualizada', description: `"${keywordData.term}" se ha actualizado correctamente.` });
    } else {
      const newKeyword: Keyword = { ...keywordData, id: crypto.randomUUID() };
      setKeywords(prev => [...prev, newKeyword]);
      toast({ title: 'Keyword añadida', description: `"${keywordData.term}" se ha añadido correctamente.` });
    }
    setEditingKeyword(null);
  };

  const handleDeleteKeyword = (keyword: Keyword) => {
    setDeleteDialog({
      open: true,
      itemName: keyword.term,
      itemType: 'keyword',
      onConfirm: () => {
        setKeywords(prev => prev.filter(k => k.id !== keyword.id));
        toast({ title: 'Keyword eliminada', description: `"${keyword.term}" se ha eliminado.` });
        setDeleteDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Configuración"
        subtitle="Gestiona los parámetros del newsroom"
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
                    {topics.map(topic => (
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
                    {entities.map(entity => (
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
                    {sources.map(source => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Impact Keywords */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-success">
                      <Badge className="bg-success/10 text-success border-success/20">+</Badge>
                      Keywords de Impacto
                    </h4>
                    <div className="space-y-2">
                      {keywords.filter(k => k.type === 'impact').map(keyword => (
                        <div 
                          key={keyword.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10"
                        >
                          <span className="font-medium">{keyword.term}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-success">+{keyword.weight}</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingKeyword(keyword);
                                setKeywordDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteKeyword(keyword)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Negative Keywords */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-destructive">
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">-</Badge>
                      Keywords Negativas
                    </h4>
                    <div className="space-y-2">
                      {keywords.filter(k => k.type === 'negative').map(keyword => (
                        <div 
                          key={keyword.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                        >
                          <span className="font-medium">{keyword.term}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-destructive">{keyword.weight}</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingKeyword(keyword);
                                setKeywordDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteKeyword(keyword)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Reglas de Scoring</CardTitle>
                <CardDescription>Configura cómo se calcula la relevancia de las noticias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Priorizar fuentes de alta fiabilidad</Label>
                        <p className="text-sm text-muted-foreground">+15 puntos para fuentes con &gt;85% fiabilidad</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Boost por topics prioritarios</Label>
                        <p className="text-sm text-muted-foreground">+20 puntos para topics P1</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Penalizar contenido antiguo</Label>
                        <p className="text-sm text-muted-foreground">-5 puntos por cada día de antigüedad</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Detectar entidades monitoreadas</Label>
                        <p className="text-sm text-muted-foreground">+10 puntos por entidad detectada</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Filtrar duplicados automáticamente</Label>
                        <p className="text-sm text-muted-foreground">Descartar noticias con &gt;80% similitud</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertas de alta prioridad</Label>
                        <p className="text-sm text-muted-foreground">Notificar noticias con score &gt;90</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button>Guardar Configuración</Button>
                </div>
              </CardContent>
            </Card>
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
