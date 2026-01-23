import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// VALIDACIÓN DE INPUTS CON ZOD
// ============================================
const RequestSchema = z.object({
  newsTitle: z.string()
    .min(1, "El título es requerido")
    .max(500, "El título no puede superar 500 caracteres"),
  newsSummary: z.string()
    .max(5000, "El resumen no puede superar 5000 caracteres")
    .default(""),
  newsUrl: z.string()
    .url("La URL no es válida")
    .max(2000, "La URL no puede superar 2000 caracteres"),
  newsSource: z.string()
    .max(200, "La fuente no puede superar 200 caracteres")
    .default(""),
  topics: z.array(
    z.string().max(100, "Cada tema no puede superar 100 caracteres")
  ).max(20, "Máximo 20 temas permitidos").default([]),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'facebook'], {
    errorMap: () => ({ message: "Plataforma no válida. Usa: linkedin, twitter, instagram o facebook" })
  }),
  variant: z.number()
    .int("La variante debe ser un número entero")
    .min(1, "La variante mínima es 1")
    .max(3, "La variante máxima es 3"),
});

type GeneratePostsRequest = z.infer<typeof RequestSchema>;

// Función para sanitizar texto (prevenir prompt injection)
function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n|\r/g, '\n')
    .trim();
}

// ============================================
// REGLAS EDITORIALES OBLIGATORIAS
// ============================================

// Límites de caracteres por plataforma (OBLIGATORIOS)
const characterLimits: Record<string, { min: number; max: number; optimal: { min: number; max: number } }> = {
  linkedin: { min: 800, max: 1400, optimal: { min: 800, max: 1400 } },
  twitter: { min: 120, max: 280, optimal: { min: 120, max: 220 } },
  instagram: { min: 150, max: 300, optimal: { min: 150, max: 300 } },
  facebook: { min: 250, max: 600, optimal: { min: 250, max: 600 } },
};

// Límites de hashtags por plataforma (OBLIGATORIOS)
const hashtagLimits: Record<string, { min: number; max: number }> = {
  linkedin: { min: 2, max: 4 },
  twitter: { min: 0, max: 2 },
  instagram: { min: 0, max: 5 },
  facebook: { min: 0, max: 2 },
};

// Palabras clave que indican rumor sin fuente
const rumorKeywords = [
  'se rumorea', 'rumor', 'podría', 'posiblemente', 'supuestamente',
  'según fuentes', 'fuentes cercanas', 'estarían negociando',
  'inminente', 'a punto de', 'muy cerca de'
];

// Fuentes fiables conocidas
const reliableSources = [
  'marca', 'as', 'mundo deportivo', 'sport', 'relevo', 'espn',
  'uefa', 'fifa', 'laliga', 'acb', 'efe', 'reuters', 'ap',
  'athletic', 'diario as', 'el país', 'el mundo', 'cope', 'cadena ser'
];

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

function countHashtags(text: string): number {
  const matches = text.match(/#\w+/g);
  return matches ? matches.length : 0;
}

function hasValidClosing(text: string): boolean {
  // Debe terminar con pregunta O con "qué observar/seguir"
  const lines = text.split('\n').filter(l => l.trim());
  const lastLines = lines.slice(-3).join(' ').toLowerCase();
  
  const hasQuestion = lastLines.includes('?');
  const hasObservar = /qu[eé]\s+(observar|seguir|vigilar|esperar|ver)/i.test(lastLines);
  const hasWatch = /(a\s+seguir|pendientes\s+de|estar\s+atentos)/i.test(lastLines);
  
  return hasQuestion || hasObservar || hasWatch;
}

function hasValidStructure(text: string): boolean {
  // Verificar que tiene la estructura: gancho + contexto + claves + cierre
  const lines = text.split('\n').filter(l => l.trim());
  
  // Al menos 4 líneas/secciones distintas
  if (lines.length < 4) return false;
  
  // Debe tener algún bullet o lista numerada para las claves
  const hasBullets = /[-•▪️🔹✓✔️→]|^\d+[.)]/m.test(text);
  const hasKeyPoints = hasBullets || lines.length >= 5;
  
  return hasKeyPoints;
}

function isRumorWithoutSource(title: string, summary: string, source: string): { isRumor: boolean; reason: string } {
  const fullText = `${title} ${summary}`.toLowerCase();
  const sourceLower = source.toLowerCase();
  
  // Verificar si la fuente es fiable
  const hasReliableSource = reliableSources.some(s => sourceLower.includes(s));
  
  // Buscar indicadores de rumor
  const rumorIndicators = rumorKeywords.filter(kw => fullText.includes(kw));
  
  // Es rumor SI: tiene palabras de rumor Y no tiene fuente fiable
  if (rumorIndicators.length > 0 && !hasReliableSource) {
    return {
      isRumor: true,
      reason: `Contiene indicadores de rumor (${rumorIndicators.slice(0, 2).join(', ')}) sin fuente verificable.`
    };
  }
  
  // Temas sensibles: fichajes/lesiones sin confirmación
  const isSensitiveTopic = /(fichaje|fichado|fichar|lesión|lesionado|operación|baja)/i.test(fullText);
  const hasConfirmation = /(oficial|confirmado|anuncia|presenta|comunica)/i.test(fullText);
  
  if (isSensitiveTopic && !hasConfirmation && !hasReliableSource) {
    return {
      isRumor: true,
      reason: 'Noticia sobre fichaje/lesión sin confirmación oficial ni fuente fiable.'
    };
  }
  
  return { isRumor: false, reason: '' };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  charCount: number;
  hashtagCount: number;
}

function validatePost(content: string, platform: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const charCount = content.length;
  const hashtagCount = countHashtags(content);
  const limits = characterLimits[platform];
  const htLimits = hashtagLimits[platform];
  
  // Validar caracteres
  if (charCount < limits.min) {
    errors.push(`Muy corto: ${charCount}/${limits.min} caracteres mínimos`);
  }
  if (charCount > limits.max) {
    errors.push(`Muy largo: ${charCount}/${limits.max} caracteres máximos`);
  }
  
  // Validar hashtags
  if (hashtagCount > htLimits.max) {
    errors.push(`Demasiados hashtags: ${hashtagCount}/${htLimits.max} máximo`);
  }
  if (hashtagCount < htLimits.min) {
    warnings.push(`Pocos hashtags: ${hashtagCount}/${htLimits.min} mínimo`);
  }
  
  // Validar cierre
  if (!hasValidClosing(content)) {
    errors.push('Falta cierre con pregunta o "qué observar"');
  }
  
  // Validar estructura (solo para LinkedIn y Facebook que son más largos)
  if ((platform === 'linkedin' || platform === 'facebook') && !hasValidStructure(content)) {
    warnings.push('La estructura podría mejorar (gancho → contexto → claves → cierre)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    charCount,
    hashtagCount
  };
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
❌ Contenido impulsivo o polémico
❌ Banalización de temas serios
❌ Frases vacías tipo "¡Qué noticia!" o "Increíble"
❌ Llamadas a la acción agresivas
❌ Sentencias absolutas o categóricas
❌ Mezclar dos noticias en un mismo post

SIEMPRE HAZ ESTO:
✅ Resumir con criterio propio, no copiar
✅ Mantener la voz de alguien con prestigio y experiencia
✅ Aportar contexto o perspectiva personal
✅ Ser conciso: calidad sobre cantidad
✅ Si hay información contradictoria, indicarlo con prudencia
✅ En fichajes/lesiones sin confirmación: tratar como posibilidad ("se habla de…", "según…", "si se confirma…")
✅ 1 noticia = 1 post (nunca mezclar)`;

const writingTemplate = `PLANTILLA DE ESCRITURA (OBLIGATORIA EN TODOS LOS POSTS):

1. GANCHO: 1 línea clara y sobria (sin sensacionalismos)
2. CONTEXTO BREVE: qué pasó (2-3 líneas máximo)
3. 3 CLAVES: en bullets o frases cortas (qué significa, qué implica)
4. CIERRE: pregunta abierta O "qué observar a partir de ahora"

Esta estructura es OBLIGATORIA. El post DEBE tener estos 4 elementos siempre.`;

const platformPrompts: Record<string, string> = {
  linkedin: `RED: LinkedIn
ESPECIFICACIONES OBLIGATORIAS:
- Longitud OBJETIVO: 800-1.400 caracteres (NUNCA menos de 800, NUNCA más de 1.400)
- Formato: 2-3 párrafos cortos + 3 bullets para las claves
- Hashtags: EXACTAMENTE 2-4 al final (nunca más de 4)
- Estructura X: 1 idea principal con gancho profesional
- Tono: más reflexivo, profesional, con visión de la industria
- Incluir siempre 1 aprendizaje o reflexión de valor
- Sin emojis o muy puntuales (máximo 1-2)
- Cierre: OBLIGATORIO pregunta profesional o "qué observar"`,

  twitter: `RED: X (Twitter)
ESPECIFICACIONES OBLIGATORIAS:
- Longitud OBJETIVO: 120-220 caracteres (permitido hasta 280, pero NUNCA superar)
- Estructura EXACTA: 1 idea principal + 1 dato/contexto + 1 pregunta final
- Hashtags: 0-2 MÁXIMO (preferiblemente 0-1)
- Conciso y directo
- Tono de opinión personal, como quien observa con experiencia
- Sin emojis
- Cierre: OBLIGATORIO con pregunta breve
- CRÍTICO: No exceder 280 caracteres bajo ningún concepto`,

  instagram: `RED: Instagram
ESPECIFICACIONES OBLIGATORIAS:
- Longitud: 150-300 caracteres aproximadamente
- Primera línea con gancho visual
- Mensajes más atemporales
- Reconocimiento a momentos y personas del deporte
- Hashtags: 0-5 máximo al final
- Emojis muy puntuales si procede
- Cierre: pregunta o reflexión`,

  facebook: `RED: Facebook
ESPECIFICACIONES OBLIGATORIAS:
- Longitud OBJETIVO: 250-600 caracteres (NUNCA menos de 250, NUNCA más de 600)
- Tono: narrativo y directo, sin perder rigor
- Más conversacional pero con gravitas
- Mensajes más atemporales y reflexivos
- Visibilidad de actos, reconocimientos y trayectorias
- Hashtags: 0-2 MÁXIMO (nunca más de 2)
- Sin emojis o muy puntuales
- Cierre: OBLIGATORIO pregunta o "qué seguir"`,
};

const baseSystemPrompt = `Eres el community manager personal de JESÚS ÁLVAREZ. Tu trabajo es redactar posts para sus redes sociales siguiendo estrictamente las directrices editoriales.

${editorialProfile}

${styleRules}

${writingTemplate}

IDIOMA: Siempre en español.

REGLAS CRÍTICAS:
1. La plantilla (gancho → contexto → 3 claves → cierre) es OBLIGATORIA
2. El cierre DEBE ser una pregunta O "qué observar/seguir"
3. Respeta ESTRICTAMENTE los límites de caracteres y hashtags
4. NUNCA mezcles dos noticias en un mismo post
5. Escribe como Jesús Álvarez en primera persona`;

async function generatePost(
  newsTitle: string,
  newsSummary: string,
  newsUrl: string,
  newsSource: string,
  topics: string[],
  platform: string,
  variant: number,
  apiKey: string,
  attempt: number = 1
): Promise<{ content: string; validation: ValidationResult }> {
  
  const limits = characterLimits[platform];
  const htLimits = hashtagLimits[platform];
  
  const variantInstruction = variant === 1 
    ? "Crea la versión ESTÁNDAR: equilibrada, siguiendo la plantilla de escritura con rigor."
    : variant === 2
      ? "Crea la versión MÁS INFORMATIVA: más datos y contexto, enfocada en los hechos y cifras."
      : "Crea la versión MÁS HUMANA: más storytelling y emoción contenida, sin perder rigor.";

  // Instrucciones de corrección si es reintento
  const correctionNote = attempt > 1 
    ? `\n\n⚠️ CORRECCIÓN REQUERIDA (intento ${attempt}):
- Ajusta la longitud a ${limits.min}-${limits.optimal.max} caracteres
- Usa exactamente ${htLimits.min}-${htLimits.max} hashtags
- ASEGÚRATE de incluir cierre con pregunta o "qué observar"
- NO excedas los límites bajo ningún concepto`
    : '';

  const systemPrompt = `${baseSystemPrompt}

${platformPrompts[platform]}

VARIANTE A GENERAR:
${variantInstruction}

FUENTE DE LA NOTICIA:
- Medio: ${newsSource || 'No especificado'}
- Enlace: ${newsUrl}

LÍMITES ESTRICTOS PARA ESTA RED:
- Caracteres: ${limits.min}-${limits.max} (objetivo: ${limits.optimal.min}-${limits.optimal.max})
- Hashtags: ${htLimits.min}-${htLimits.max}
${correctionNote}`;

  const userPrompt = `NOTICIA A TRANSFORMAR EN POST:

Titular: "${newsTitle}"

Resumen: ${newsSummary}

Temas relacionados: ${topics.join(', ')}

Fuente: ${newsSource || 'No especificada'}
URL: ${newsUrl}

---

Genera ahora el post para ${platform.toUpperCase()} siguiendo todas las directrices editoriales.
RECUERDA: 
- Estructura obligatoria: gancho → contexto → 3 claves → cierre (pregunta)
- Límites: ${limits.min}-${limits.max} caracteres, ${htLimits.min}-${htLimits.max} hashtags`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: attempt > 1 ? 0.5 : 0.7, // Más determinístico en reintentos
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const validation = validatePost(content, platform);

  return { content, validation };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================
    // AUTENTICACIÓN: Validar JWT del usuario
    // ============================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Authentication failed: No authorization header');
      return new Response(
        JSON.stringify({ error: 'No autorizado. Por favor, inicia sesión.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Authentication failed: Invalid token', claimsError);
      return new Response(
        JSON.stringify({ error: 'Sesión inválida. Por favor, inicia sesión de nuevo.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // ============================================
    // VALIDACIÓN DE INPUTS
    // ============================================
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      console.error('Invalid JSON body');
      return new Response(
        JSON.stringify({ error: 'El cuerpo de la solicitud no es JSON válido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
      console.error('Validation failed:', errorMessages);
      return new Response(
        JSON.stringify({ error: `Datos inválidos: ${errorMessages}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Datos validados y sanitizados
    const validated = validationResult.data;
    const newsTitle = sanitizeText(validated.newsTitle);
    const newsSummary = sanitizeText(validated.newsSummary);
    const newsUrl = validated.newsUrl;
    const newsSource = sanitizeText(validated.newsSource);
    const topics = validated.topics.map(t => sanitizeText(t));
    const platform = validated.platform;
    const variant = validated.variant;

    console.log(`Processing validated request for platform: ${platform}, variant: ${variant}`);

    // ============================================
    // VALIDACIÓN DE RUMORES SIN FUENTE
    // ============================================
    const rumorCheck = isRumorWithoutSource(newsTitle, newsSummary, newsSource);
    if (rumorCheck.isRumor) {
      console.log(`Rumor detected: ${rumorCheck.reason}`);
      return new Response(
        JSON.stringify({ 
          error: 'Noticia no apta para publicación',
          reason: rumorCheck.reason,
          suggestion: 'Busca una noticia con confirmación oficial o fuente fiable.',
          isNotSuitable: true
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // ============================================
    // LÓGICA DE NEGOCIO CON REGENERACIÓN AUTOMÁTICA
    // ============================================
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const MAX_ATTEMPTS = 3;
    let bestResult: { content: string; validation: ValidationResult } | null = null;
    let attempts: { content: string; validation: ValidationResult }[] = [];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`Generation attempt ${attempt}/${MAX_ATTEMPTS} for ${platform} variant ${variant}`);
      
      try {
        const result = await generatePost(
          newsTitle, newsSummary, newsUrl, newsSource, topics,
          platform, variant, LOVABLE_API_KEY, attempt
        );
        
        attempts.push(result);
        
        if (result.validation.isValid) {
          bestResult = result;
          console.log(`Valid post generated on attempt ${attempt}: ${result.validation.charCount} chars, ${result.validation.hashtagCount} hashtags`);
          break;
        }
        
        console.log(`Attempt ${attempt} failed validation:`, result.validation.errors);
        
        // Guardar el mejor resultado parcial
        if (!bestResult || result.validation.errors.length < bestResult.validation.errors.length) {
          bestResult = result;
        }
      } catch (error) {
        console.error(`Attempt ${attempt} error:`, error);
        if (attempt === MAX_ATTEMPTS) throw error;
      }
    }

    if (!bestResult) {
      throw new Error('Failed to generate post after all attempts');
    }

    const { content, validation } = bestResult;

    console.log(`Final result for ${platform} variant ${variant}: ${validation.charCount} chars, valid: ${validation.isValid}`);

    return new Response(
      JSON.stringify({ 
        content, 
        platform, 
        variant,
        metadata: {
          source: newsSource,
          sourceTitle: newsTitle,
          url: newsUrl,
          charCount: validation.charCount,
          hashtagCount: validation.hashtagCount,
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          attemptsNeeded: attempts.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Generate posts error:', error);
    
    if (error.message?.includes('429')) {
      return new Response(
        JSON.stringify({ error: 'Demasiadas solicitudes. Por favor, espera un momento antes de generar más posts.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (error.message?.includes('402')) {
      return new Response(
        JSON.stringify({ error: 'Créditos agotados. Añade créditos a tu workspace en Lovable.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Error generando post. Por favor, intenta de nuevo.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
