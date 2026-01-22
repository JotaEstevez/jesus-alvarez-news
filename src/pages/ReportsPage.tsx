import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockDrafts, mockNewsItems } from '@/data/mockData';
import { 
  Download,
  TrendingUp,
  Eye,
  MessageSquare,
  Share2,
  BarChart3,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock metrics data
const mockMetrics = {
  totalPosts: 45,
  totalImpressions: 125000,
  totalEngagements: 8500,
  avgEngagementRate: 6.8,
  topPlatform: 'linkedin',
};

const platformStats = [
  { platform: 'linkedin' as const, posts: 18, impressions: 65000, engagements: 4200, rate: 6.5 },
  { platform: 'twitter' as const, posts: 15, impressions: 32000, engagements: 2100, rate: 6.6 },
  { platform: 'instagram' as const, posts: 8, impressions: 18000, engagements: 1500, rate: 8.3 },
  { platform: 'facebook' as const, posts: 4, impressions: 10000, engagements: 700, rate: 7.0 },
];

export function ReportsPage() {
  const getNewsTitle = (newsItemId: string) => {
    const news = mockNewsItems.find(n => n.id === newsItemId);
    return news?.title || 'Noticia no encontrada';
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Reportes y Métricas"
        subtitle="Análisis de rendimiento de publicaciones"
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        }
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Posts Totales</p>
                  <p className="text-3xl font-bold mt-1">{mockMetrics.totalPosts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Este mes</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impresiones</p>
                  <p className="text-3xl font-bold mt-1">{(mockMetrics.totalImpressions / 1000).toFixed(0)}K</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-info" />
                </div>
              </div>
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs mes anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interacciones</p>
                  <p className="text-3xl font-bold mt-1">{(mockMetrics.totalEngagements / 1000).toFixed(1)}K</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-success" />
                </div>
              </div>
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8% vs mes anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Engagement</p>
                  <p className="text-3xl font-bold mt-1">{mockMetrics.avgEngagementRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Promedio todas las redes</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Rendimiento por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformStats.map(stat => (
                <div 
                  key={stat.platform} 
                  className="p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <PlatformBadge platform={stat.platform} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts</span>
                      <span className="font-medium">{stat.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impresiones</span>
                      <span className="font-medium">{(stat.impressions / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium text-success">{stat.rate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Publications Table */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Historial de Publicaciones</CardTitle>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Buscar publicaciones..." 
                className="w-[200px]"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Impresiones</TableHead>
                  <TableHead className="text-right">Engagements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDrafts.map(draft => (
                  <TableRow key={draft.id}>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(draft.updatedAt, "d MMM", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlatformBadge platform={draft.platform} size="sm" />
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm truncate">{draft.content}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={draft.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {draft.status === 'published' ? '12.5K' : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {draft.status === 'published' ? '856' : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
