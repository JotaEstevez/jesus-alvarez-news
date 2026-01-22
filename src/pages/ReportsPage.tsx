import { useState } from 'react';
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
import { useNewsroom } from '@/context/NewsroomContext';
import { Platform } from '@/types/newsroom';
import { 
  Download,
  TrendingUp,
  Eye,
  MessageSquare,
  Share2,
  BarChart3,
  Calendar,
  Search
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

export function ReportsPage() {
  const { drafts, newsItems } = useNewsroom();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter only published or approved drafts for reporting
  const reportableDrafts = drafts.filter(d => 
    d.status === 'published' || d.status === 'approved'
  );
  
  const filteredDrafts = reportableDrafts.filter(draft => {
    if (!searchQuery) return true;
    const news = newsItems.find(n => n.id === draft.newsItemId);
    return (
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (news?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getNewsTitle = (newsItemId: string) => {
    const news = newsItems.find(n => n.id === newsItemId);
    return news?.title || 'Noticia no encontrada';
  };

  // Calculate real metrics from drafts
  const calculateMetrics = () => {
    const published = drafts.filter(d => d.status === 'published');
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
    
    const thisWeekPosts = published.filter(d => 
      isWithinInterval(d.updatedAt, { start: thisWeekStart, end: thisWeekEnd })
    ).length;
    
    const lastWeekPosts = published.filter(d => 
      isWithinInterval(d.updatedAt, { start: lastWeekStart, end: lastWeekEnd })
    ).length;

    return {
      totalPosts: drafts.length,
      publishedPosts: published.length,
      pendingPosts: drafts.filter(d => d.status === 'pending').length,
      approvedPosts: drafts.filter(d => d.status === 'approved').length,
      thisWeekPosts,
      lastWeekPosts,
      weeklyChange: lastWeekPosts > 0 
        ? Math.round(((thisWeekPosts - lastWeekPosts) / lastWeekPosts) * 100) 
        : thisWeekPosts > 0 ? 100 : 0,
    };
  };

  const metrics = calculateMetrics();

  // Calculate platform stats
  const calculatePlatformStats = () => {
    const platforms: Platform[] = ['linkedin', 'twitter', 'instagram', 'facebook'];
    return platforms.map(platform => {
      const platformDrafts = drafts.filter(d => d.platform === platform);
      const published = platformDrafts.filter(d => d.status === 'published').length;
      const pending = platformDrafts.filter(d => d.status === 'pending').length;
      const approved = platformDrafts.filter(d => d.status === 'approved').length;
      
      return {
        platform,
        total: platformDrafts.length,
        published,
        pending,
        approved,
        // Mock engagement data (in real app would come from API)
        impressions: published * Math.floor(Math.random() * 5000 + 2000),
        rate: (Math.random() * 5 + 3).toFixed(1),
      };
    });
  };

  const platformStats = calculatePlatformStats();

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Plataforma', 'Estado', 'Contenido'];
    const rows = filteredDrafts.map(draft => [
      format(draft.updatedAt, 'yyyy-MM-dd'),
      draft.platform,
      draft.status,
      `"${draft.content.replace(/"/g, '""').substring(0, 100)}..."`,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-posts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Reportes y Métricas"
        subtitle="Análisis de rendimiento de publicaciones"
        actions={
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
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
                  <p className="text-3xl font-bold mt-1">{metrics.totalPosts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">En todas las etapas</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publicados</p>
                  <p className="text-3xl font-bold mt-1">{metrics.publishedPosts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-success" />
                </div>
              </div>
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {metrics.thisWeekPosts} esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-3xl font-bold mt-1">{metrics.pendingPosts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-warning" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Esperando revisión</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprobados</p>
                  <p className="text-3xl font-bold mt-1">{metrics.approvedPosts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-info" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Listos para publicar</p>
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
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publicados</span>
                      <span className="font-medium text-success">{stat.published}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pendientes</span>
                      <span className="font-medium text-warning">{stat.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aprobados</span>
                      <span className="font-medium text-info">{stat.approved}</span>
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
            <CardTitle className="text-base">Historial de Posts</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar posts..." 
                  className="w-[200px] pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                  <TableHead>Variante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrafts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay posts publicados o aprobados todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrafts.map(draft => (
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
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {getNewsTitle(draft.newsItemId)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={draft.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        V{draft.variant}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
