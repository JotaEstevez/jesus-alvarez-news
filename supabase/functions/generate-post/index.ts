import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePostsRequest {
  newsTitle: string;
  newsSummary: string;
  newsUrl: string;
  newsSource: string;
  topics: string[];
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  variant: number;
}

// ============================================
// CONFIGURACIÓN EDITORIAL: JESÚS ÁLVAREZ
// ============================================

const editorialProfile = `PERFIL EDITORIAL DE JESÚS ÁLVAREZ:
- Periodista deportivo con larga trayectoria y prestigio reconocido
- Presidente de la Asociación Española de la Prensa Deportiva (AEPD)
- Voz personal con contexto institucional (no al revés)
- Rol: Editor y ghostwriter de su marca personal
- Frecuencia objetivo: 2 publicaciones por semana

COBERTURA TEMÁTICA:
- Todos los deportes: fútbol, baloncesto, tenis, motor, ciclismo, deportes olímpicos y otros
- Industria del deporte y medios: derechos TV/streaming, audiencias, patrocinio, reputación, tecnología aplicada al deporte
- Prioridad España, pero incluir internacional cuando sea relevante`;

const styleRules = `ESTILO OBLIGATORIO:
- Opinión suave: criterio, matices y contexto (NO sentencias absolutas)
- Rigor periodístico
- Tono profesional-cercano
- Lenguaje claro, natural y cercano
- Sobrio pero humano, con criterio y experiencia
- Respeto al entorno profesional y deportivo
- Reconocimiento a personas, trayectorias y acontecimientos
- Sin artificios, sin forzar protagonismos

PROHIBIDO (NUNCA HAGAS ESTO):
❌ Ataques personales
❌ Sarcasmo
❌ Política partidista
❌ Referencias a apuestas
❌ Rumores sin fuente sólida
❌ Copiar texto literal de noticias
❌ Tono corporativo o institucional forzado
❌ Emojis excesivos (máximo 1-2 si procede)
❌ Hashtags abusivos (máximo 2-4)
❌ Contenido impulsivo o polémico
❌ Banalización de temas serios
❌ Frases vacías tipo "¡Qué noticia!" o "Increíble"
❌ Llamadas a la acción agresivas

SIEMPRE HAZ ESTO:
✅ Resumir con criterio propio, no copiar
✅ Mantener la voz de alguien con prestigio y experiencia
✅ Aportar contexto o perspectiva personal
✅ Ser conciso: calidad sobre cantidad
✅ Si hay información contradictoria, indicarlo con prudencia
✅ En fichajes/lesiones sin confirmación: tratar como posibilidad ("se habla de…", "según…", "si se confirma…")`;

const writingTemplate = `PLANTILLA DE ESCRITURA (USAR SIEMPRE):

1. GANCHO: 1 línea clara y sobria (sin sensacionalismos)
2. CONTEXTO BREVE: qué pasó (2-3 líneas máximo)
3. 3 CLAVES: en bullets o frases cortas (qué significa, qué implica)
4. CIERRE: pregunta abierta o "qué observar a partir de ahora"
5. HASHTAGS: máximo 2-4, relevantes y discretos al final`;

const platformPrompts: Record<string, string> = {
  linkedin: `RED: LinkedIn
ESPECIFICACIONES:
- Longitud: 900-1.400 caracteres aproximadamente
- Tono: más reflexivo, profesional
- Incluir siempre 1 aprendizaje o reflexión de valor
- Formato: 2-3 párrafos cortos + bullets para las claves
- Máximo 3-4 hashtags discretos al final
- Sin emojis o muy puntuales (máximo 1-2)
- Visión personal sobre el periodismo deportivo y la industria`,

  twitter: `RED: X (Twitter)
ESPECIFICACIONES:
- Longitud: 180-280 caracteres aproximadamente (máximo 1 tweet)
- Estructura: 1 idea principal + 1 dato/contexto + pregunta final
- Conciso y directo
- Tono de opinión personal, como quien observa con experiencia
- Sin hashtags o máximo 1 muy relevante
- Sin emojis
- Invitar a la reflexión sin polarizar`,

  instagram: `RED: Instagram
ESPECIFICACIONES:
- Longitud: 150-300 caracteres aproximadamente
- Primera línea con gancho visual
- Mensajes más atemporales
- Reconocimiento a momentos y personas del deporte
- 3-5 hashtags máximo al final
- Emojis muy puntuales si procede`,

  facebook: `RED: Facebook
ESPECIFICACIONES:
- Longitud: 300-700 caracteres aproximadamente
- Tono: narrativo y directo, sin perder rigor
- Más conversacional pero con gravitas
- Mensajes más atemporales y reflexivos
- Visibilidad de actos, reconocimientos y trayectorias
- Máximo 2 hashtags
- Sin emojis o muy puntuales`,
};

const baseSystemPrompt = `Eres el community manager personal de JESÚS ÁLVAREZ. Tu trabajo es redactar posts para sus redes sociales siguiendo estrictamente las directrices editoriales.

${editorialProfile}

${styleRules}

${writingTemplate}

IDIOMA: Siempre en español.

IMPORTANTE:
- Escribe SIEMPRE como si fueras Jesús Álvarez en primera persona
- Cada post debe seguir la plantilla de escritura (gancho → contexto → claves → cierre)
- Adapta el contenido a la red específica respetando los límites de caracteres
- Mantén el equilibrio entre opinión personal y rigor informativo`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsTitle, newsSummary, newsUrl, newsSource, topics, platform, variant } = await req.json() as GeneratePostsRequest;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const variantInstruction = variant === 1 
      ? "Crea la versión ESTÁNDAR: equilibrada, siguiendo la plantilla de escritura con rigor."
      : variant === 2
        ? "Crea la versión MÁS INFORMATIVA: más datos y contexto, enfocada en los hechos y cifras."
        : "Crea la versión MÁS HUMANA: más storytelling y emoción contenida, sin perder rigor.";

    const systemPrompt = `${baseSystemPrompt}

${platformPrompts[platform]}

VARIANTE A GENERAR:
${variantInstruction}

FUENTE DE LA NOTICIA:
- Medio: ${newsSource || 'No especificado'}
- Enlace: ${newsUrl}

Recuerda:
- Respeta estrictamente los límites de caracteres de la red
- Sigue la plantilla: gancho → contexto → 3 claves → cierre con pregunta
- Mantén "opinión suave": interpretación sin polarizar, con matices
- NO uses fórmulas genéricas de community manager`;

    const userPrompt = `NOTICIA A TRANSFORMAR EN POST:

Titular: "${newsTitle}"

Resumen: ${newsSummary}

Temas relacionados: ${topics.join(', ')}

Fuente: ${newsSource || 'No especificada'}
URL: ${newsUrl}

---

Genera ahora el post para ${platform.toUpperCase()} siguiendo todas las directrices editoriales.`;

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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Por favor, espera un momento antes de generar más posts.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos agotados. Añade créditos a tu workspace en Lovable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log(`Generated ${platform} post variant ${variant} (${content.length} chars): ${content.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ 
        content, 
        platform, 
        variant,
        metadata: {
          source: newsSource,
          url: newsUrl,
          charCount: content.length
        }
      }),
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
