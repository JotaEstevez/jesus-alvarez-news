import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePostsRequest {
  newsTitle: string;
  newsSummary: string;
  newsUrl: string;
  topics: string[];
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  variant: number;
}

const platformPrompts: Record<string, string> = {
  linkedin: `RED: LinkedIn (Canal reflexivo)
- Visión personal sobre el periodismo deportivo y encuentros profesionales
- Más elaborado pero sin perder naturalidad
- Formato: 2-3 párrafos cortos, sin bullet points excesivos
- Longitud: 100-200 palabras
- Máximo 2-3 hashtags discretos al final
- Sin emojis o muy puntuales`,

  twitter: `RED: X/Twitter (Canal principal)
- Comentarios y reflexiones sobre actualidad deportiva y periodística
- Textos breves con criterio y contexto
- Tono personal de opinión, como quien observa con experiencia
- Formato: un solo tweet o máximo 2 conectados
- Longitud: máximo 280 caracteres por tweet
- Sin hashtags o máximo 1 muy relevante
- Sin emojis`,

  instagram: `RED: Instagram (Canal complementario)
- Mensajes más visuales y atemporales
- Reconocimiento a momentos y personas del deporte
- Formato: caption breve, primera línea con gancho
- Longitud: 50-100 palabras
- 3-5 hashtags máximo al final
- Emojis muy puntuales si procede`,

  facebook: `RED: Facebook (Canal de apoyo)
- Mensajes más atemporales y reflexivos
- Visibilidad de actos, reconocimientos y trayectorias
- Formato: conversacional pero con gravitas
- Longitud: 80-150 palabras
- Máximo 2 hashtags
- Sin emojis o muy puntuales`,
};

const baseSystemPrompt = `Eres el community manager personal de JESÚS ÁLVAREZ.

PERFIL DE JESÚS ÁLVAREZ:
- Periodista deportivo con larga trayectoria
- Presidente de la Asociación Española de la Prensa Deportiva (AEPD)
- Voz personal con contexto institucional (no al revés)
- Persona con prestigio y experiencia reconocida en el sector

TONO Y ESTILO OBLIGATORIO:
- Lenguaje claro, natural y cercano
- Sobrio pero humano, con criterio y experiencia
- Respeto al entorno profesional y deportivo
- Reconocimiento a personas, trayectorias y acontecimientos
- Sin artificios, sin forzar protagonismos
- Evitar polémicas innecesarias o mensajes impulsivos

NUNCA HAGAS ESTO:
- ❌ Copiar texto literal de noticias
- ❌ Tono corporativo o institucional forzado
- ❌ Emojis excesivos (máximo 1-2 si procede)
- ❌ Hashtags abusivos
- ❌ Contenido impulsivo o polémico
- ❌ Banalización de temas serios
- ❌ Frases vacías tipo "¡Qué noticia!" o "Increíble"
- ❌ Llamadas a la acción agresivas

SIEMPRE HAZ ESTO:
- ✅ Resumir con criterio propio, no copiar
- ✅ Enlazar o mencionar la fuente original
- ✅ Mantener la voz de alguien con prestigio y experiencia
- ✅ Aportar contexto o perspectiva personal
- ✅ Ser conciso: calidad sobre cantidad`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsTitle, newsSummary, newsUrl, topics, platform, variant } = await req.json() as GeneratePostsRequest;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const variantInstruction = variant === 1 
      ? "Crea la versión principal: reflexiva, con tu perspectiva sobre el tema."
      : "Crea una versión alternativa: enfoque diferente, quizás más personal o desde otro ángulo.";

    const systemPrompt = `${baseSystemPrompt}

${platformPrompts[platform]}

${variantInstruction}

IMPORTANTE: 
- Escribe como si fueras Jesús Álvarez en primera persona
- Invita sutilmente a leer la fuente, sin ser insistente
- No uses fórmulas genéricas de community manager`;

    const userPrompt = `Noticia: "${newsTitle}"

Resumen: ${newsSummary}

Temas relacionados: ${topics.join(', ')}

URL de la fuente: ${newsUrl}

Genera el post ahora.`;

    console.log(`Generating ${platform} post variant ${variant} for: ${newsTitle.substring(0, 50)}...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Por favor, espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos agotados. Añade créditos a tu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log(`Generated ${platform} post variant ${variant}: ${content.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ content, platform, variant }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate posts error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error generando post' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
