import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseFeed } from "https://deno.land/x/rss@1.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RssItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: Date;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================
    // AUTENTICACIÓN
    // ============================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'No autorizado.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Token inválido.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`Fetching RSS for user: ${userId}`);

    // ============================================
    // OBTENER FUENTES RSS ACTIVAS
    // ============================================
    const { data: rssSources, error: sourcesError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('Error fetching RSS sources:', sourcesError);
      throw new Error('Error al obtener fuentes RSS');
    }

    if (!rssSources || rssSources.length === 0) {
      console.log('No active RSS sources found');
      return new Response(
        JSON.stringify({ message: 'No hay fuentes RSS activas.', imported: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${rssSources.length} active RSS sources`);

    // ============================================
    // OBTENER URLs EXISTENTES PARA EVITAR DUPLICADOS
    // ============================================
    const { data: existingNews, error: existingError } = await supabase
      .from('news_items')
      .select('url');

    if (existingError) {
      console.error('Error fetching existing news:', existingError);
      throw new Error('Error al verificar noticias existentes');
    }

    const existingUrls = new Set((existingNews || []).map(n => n.url));
    console.log(`Found ${existingUrls.size} existing news URLs`);

    // ============================================
    // PROCESAR CADA FUENTE RSS
    // ============================================
    let totalImported = 0;
    const errors: string[] = [];

    for (const source of rssSources) {
      try {
        console.log(`Fetching RSS from: ${source.url}`);
        
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'NewsroomBot/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const xml = await response.text();
        const feed = await parseFeed(xml);

        const items: RssItem[] = feed.entries.slice(0, 20).map(entry => ({
          title: entry.title?.value || 'Sin título',
          link: entry.links?.[0]?.href || entry.id || '',
          description: entry.description?.value || entry.content?.value || '',
          pubDate: entry.published ? new Date(entry.published) : undefined,
        }));

        console.log(`Parsed ${items.length} items from ${source.name}`);

        // Filtrar duplicados
        const newItems = items.filter(item => item.link && !existingUrls.has(item.link));
        console.log(`${newItems.length} new items after dedup`);

        // Insertar nuevas noticias
        for (const item of newItems) {
          const newsToInsert = {
            user_id: userId,
            url: item.link,
            title: item.title.substring(0, 500),
            source: source.name,
            summary: (item.description || '').substring(0, 2000).replace(/<[^>]*>/g, ''),
            status: 'new',
            score: 50,
            topics: source.category ? [source.category] : [],
            published_at: item.pubDate?.toISOString() || null,
          };

          const { error: insertError } = await supabase
            .from('news_items')
            .insert(newsToInsert);

          if (insertError) {
            console.error('Error inserting news item:', insertError);
          } else {
            existingUrls.add(item.link);
            totalImported++;
          }
        }

        // Actualizar last_fetched_at
        await supabase
          .from('rss_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id);

      } catch (sourceError) {
        const errorMessage = `Error en ${source.name}: ${sourceError instanceof Error ? sourceError.message : 'Error desconocido'}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    console.log(`Total imported: ${totalImported}`);

    return new Response(
      JSON.stringify({ 
        message: `Se importaron ${totalImported} noticias nuevas.`,
        imported: totalImported,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch RSS error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar fuentes RSS.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
