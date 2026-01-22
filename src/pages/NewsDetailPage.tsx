import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScoreIndicator } from '@/components/ui/score-indicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockNewsItems } from '@/data/mockData';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const newsItem = mockNewsItems.find(item => item.id === id);

  if (!newsItem) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Noticia no encontrada</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Detalle de Noticia"
        actions={
          <div className="flex items-center gap-3">
            <Link to="/inbox">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
            <Link to={`/generator/${newsItem.id}`}>
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Sparkles className="h-4 w-4" />
                Generar Posts
              </Button>
            </Link>
          </div>
        }
      />
      
      <div className="p-6 max-w-5xl">
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <ScoreIndicator score={newsItem.score} size="lg" />
                
                <div className="flex-1">
                  <h1 className="text-2xl font-display font-semibold text-foreground">
                    {newsItem.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{newsItem.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(newsItem.publishedAt, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                    <a 
                      href={newsItem.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-accent hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver artículo original
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    {newsItem.topics.map(topic => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                    {newsItem.entities.map(entity => (
                      <Badge key={entity} variant="outline">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-accent" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {newsItem.summary}
                </p>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Puntos Clave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {newsItem.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 text-success text-xs flex items-center justify-center font-medium mt-0.5">
                        {index + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Verification Risks */}
            {newsItem.verificationRisks.length > 0 && (
              <Card className="shadow-card border-warning/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    Riesgos de Verificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {newsItem.verificationRisks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Editorial Angle */}
            <Card className="shadow-card bg-accent-muted border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Ángulo Editorial Sugerido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed font-medium">
                  {newsItem.editorialAngle}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
