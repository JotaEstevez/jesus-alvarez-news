import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [activeTab, setActiveTab] = useState('topics');

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
                <Button className="gap-2">
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
                    {mockTopics.map(topic => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-medium">{topic.name}</TableCell>
                        <TableCell className="text-muted-foreground">{topic.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">P{topic.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
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
                <Button className="gap-2">
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
                    {mockEntities.map(entity => (
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
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
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
                <Button className="gap-2">
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
                    {mockSources.map(source => (
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
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
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
                <Button className="gap-2">
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
                      {mockKeywords.filter(k => k.type === 'impact').map(keyword => (
                        <div 
                          key={keyword.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10"
                        >
                          <span className="font-medium">{keyword.term}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-success">+{keyword.weight}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-3.5 w-3.5" />
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
                      {mockKeywords.filter(k => k.type === 'negative').map(keyword => (
                        <div 
                          key={keyword.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                        >
                          <span className="font-medium">{keyword.term}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-destructive">{keyword.weight}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-3.5 w-3.5" />
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
    </MainLayout>
  );
}
