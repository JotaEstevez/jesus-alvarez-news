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
  linkedin: `Genera un post para LinkedIn. 
- Formato: párrafos cortos, emojis profesionales, bullet points si aplica
- Longitud: 150-300 palabras
- Incluye hashtags relevantes al final (3-5)
- Usa espaciado para mejorar legibilidad`,

  twitter: `Genera un post para X (Twitter).
- Formato: conciso y directo, puede ser un hilo corto (3-5 tweets máximo)
- Longitud: máximo 280 caracteres por tweet
- Usa → o • para puntos clave
- Máximo 2 hashtags`,

  instagram: `Genera un caption para Instagram.
- Formato: atractivo y visual, primera línea gancho
- Longitud: 100-200 palabras
- Incluye emojis relevantes
- Hashtags al final separados por puntos (10-15)`,

  facebook: `Genera un post para Facebook.
- Formato: conversacional y cercano
- Longitud: 100-200 palabras
- Incluye llamada a la acción
- Máximo 3 hashtags`,
};

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
      ? "Crea la versión principal: informativa y profesional."
      : "Crea una versión alternativa: más cercana, con pregunta o llamada a la acción diferente.";

    const systemPrompt = `Eres el community manager de Jesús Álvarez, un experto en liderazgo, economía digital, innovación y sostenibilidad empresarial.

Tu objetivo es crear contenido que:
- NO copie texto literal de las noticias, sino que resuma con criterio propio
- Tenga un tono profesional pero cercano, con empatía y confianza ("human premium")
- Aporte valor y perspectiva única sobre la noticia
- Genere engagement con la audiencia

${platformPrompts[platform]}

${variantInstruction}

IMPORTANTE: 
- Siempre menciona o invita a leer la fuente original
- Adapta el mensaje al público de cada red social
- Evita clickbait pero sé atractivo`;

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
