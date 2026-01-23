import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const initialTopics = [
  { name: 'Economía Digital', description: 'Transformación digital y economía', priority: 1 },
  { name: 'Innovación', description: 'Nuevas tecnologías y startups', priority: 2 },
  { name: 'Liderazgo', description: 'Gestión y liderazgo empresarial', priority: 3 },
  { name: 'Sostenibilidad', description: 'ESG y responsabilidad corporativa', priority: 4 },
  { name: 'Tenis', description: 'Actualidad del tenis mundial', priority: 1 },
  { name: 'Fútbol', description: 'Noticias de fútbol nacional e internacional', priority: 1 },
  { name: 'Industria Deportiva', description: 'Derechos TV, patrocinios, audiencias', priority: 2 },
  { name: 'Legado Deportivo', description: 'Trayectorias y reconocimientos', priority: 3 },
  { name: 'Baloncesto', description: 'ACB, Euroliga, NBA', priority: 2 },
  { name: 'Motor', description: 'F1, MotoGP, Rally', priority: 3 },
  { name: 'Ciclismo', description: 'Tour, Vuelta, Giro', priority: 3 },
];

const initialEntities = [
  { name: 'OpenAI', type: 'company', aliases: ['ChatGPT', 'GPT'] },
  { name: 'Google', type: 'company', aliases: ['Alphabet', 'DeepMind'] },
  { name: 'Elon Musk', type: 'person', aliases: ['Musk'] },
  { name: 'Rafael Nadal', type: 'person', aliases: ['Nadal', 'Rafa'] },
  { name: 'Roger Federer', type: 'person', aliases: ['Federer', 'Roger'] },
  { name: 'Carlos Alcaraz', type: 'person', aliases: ['Alcaraz', 'Carlitos'] },
  { name: 'RTVE', type: 'company', aliases: ['TVE', 'La 1'] },
  { name: 'Mediapro', type: 'company', aliases: ['Grupo Mediapro'] },
  { name: 'FIFA', type: 'organization', aliases: [] },
  { name: 'AEPD', type: 'organization', aliases: ['Asociación Española de la Prensa Deportiva'] },
];

const initialSources = [
  { name: 'El País', url: 'https://elpais.com', reliability: 90, category: 'Nacional' },
  { name: 'Financial Times', url: 'https://ft.com', reliability: 95, category: 'Internacional' },
  { name: 'TechCrunch', url: 'https://techcrunch.com', reliability: 85, category: 'Tecnología' },
  { name: 'Olympics.com', url: 'https://olympics.com', reliability: 95, category: 'Deportes' },
  { name: 'RTVE', url: 'https://rtve.es', reliability: 90, category: 'Nacional' },
  { name: 'MARCA', url: 'https://marca.com', reliability: 85, category: 'Deportes' },
  { name: 'AS', url: 'https://as.com', reliability: 85, category: 'Deportes' },
  { name: 'Mundo Deportivo', url: 'https://mundodeportivo.com', reliability: 85, category: 'Deportes' },
  { name: 'Sport', url: 'https://sport.es', reliability: 80, category: 'Deportes' },
  { name: 'Relevo', url: 'https://relevo.com', reliability: 90, category: 'Deportes' },
  { name: 'The Athletic', url: 'https://theathletic.com', reliability: 95, category: 'Internacional' },
  { name: 'ESPN', url: 'https://espn.com', reliability: 90, category: 'Internacional' },
  { name: 'UEFA', url: 'https://uefa.com', reliability: 100, category: 'Oficial' },
  { name: 'LaLiga', url: 'https://laliga.com', reliability: 100, category: 'Oficial' },
  { name: 'RFEF', url: 'https://rfef.es', reliability: 100, category: 'Oficial' },
  { name: 'ACB', url: 'https://acb.com', reliability: 100, category: 'Oficial' },
];

const initialKeywords = [
  // Keywords existentes
  { term: 'inteligencia artificial', type: 'impact', weight: 10 },
  { term: 'startup', type: 'impact', weight: 8 },
  { term: 'polémica', type: 'negative', weight: -5 },
  { term: 'escándalo', type: 'negative', weight: -10 },
  { term: 'legado', type: 'impact', weight: 8 },
  { term: 'derechos TV', type: 'impact', weight: 9 },
  { term: 'Mundial', type: 'impact', weight: 10 },
  // Keywords principales deportivas
  { term: 'fichaje', type: 'impact', weight: 8 },
  { term: 'récord', type: 'impact', weight: 9 },
  { term: 'histórico', type: 'impact', weight: 10 },
  { term: 'debut', type: 'impact', weight: 7 },
  { term: 'retirada', type: 'impact', weight: 10 },
  { term: 'audiencia', type: 'impact', weight: 8 },
  // Keywords extras
  { term: 'lesión', type: 'impact', weight: 6 },
  { term: 'campeón', type: 'impact', weight: 9 },
  { term: 'clasificación', type: 'impact', weight: 6 },
  { term: 'exclusiva', type: 'impact', weight: 7 },
  { term: 'AEPD', type: 'impact', weight: 10 },
  // Keywords negativas
  { term: 'rumor', type: 'negative', weight: -7 },
  { term: 'apuestas', type: 'negative', weight: -10 },
  { term: 'pelea', type: 'negative', weight: -6 },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const results = { topics: 0, entities: 0, sources: 0, keywords: 0 };

    // Insert topics
    const topicsToInsert = initialTopics.map(t => ({ ...t, user_id: userId }));
    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .upsert(topicsToInsert, { onConflict: 'user_id,name', ignoreDuplicates: true })
      .select();
    if (!topicsError) results.topics = topicsData?.length || initialTopics.length;

    // Insert entities
    const entitiesToInsert = initialEntities.map(e => ({ ...e, user_id: userId }));
    const { data: entitiesData, error: entitiesError } = await supabase
      .from('entities')
      .upsert(entitiesToInsert, { onConflict: 'user_id,name', ignoreDuplicates: true })
      .select();
    if (!entitiesError) results.entities = entitiesData?.length || initialEntities.length;

    // Insert sources
    const sourcesToInsert = initialSources.map(s => ({ ...s, user_id: userId }));
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('sources')
      .upsert(sourcesToInsert, { onConflict: 'user_id,name', ignoreDuplicates: true })
      .select();
    if (!sourcesError) results.sources = sourcesData?.length || initialSources.length;

    // Insert keywords
    const keywordsToInsert = initialKeywords.map(k => ({ ...k, user_id: userId }));
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('keywords')
      .upsert(keywordsToInsert, { onConflict: 'user_id,term', ignoreDuplicates: true })
      .select();
    if (!keywordsError) results.keywords = keywordsData?.length || initialKeywords.length;

    console.log('Seed results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos iniciales cargados correctamente',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error cargando datos' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
