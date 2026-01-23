import { NewsItem, PostDraft, Topic, Entity, Source, Keyword, CalendarEvent } from '@/types/newsroom';

export const mockTopics: Topic[] = [
  { id: '1', name: 'Economía Digital', description: 'Transformación digital y economía', priority: 1 },
  { id: '2', name: 'Innovación', description: 'Nuevas tecnologías y startups', priority: 2 },
  { id: '3', name: 'Liderazgo', description: 'Gestión y liderazgo empresarial', priority: 3 },
  { id: '4', name: 'Sostenibilidad', description: 'ESG y responsabilidad corporativa', priority: 4 },
  { id: '5', name: 'Tenis', description: 'Actualidad del tenis mundial', priority: 1 },
  { id: '6', name: 'Fútbol', description: 'Noticias de fútbol nacional e internacional', priority: 1 },
  { id: '7', name: 'Industria Deportiva', description: 'Derechos TV, patrocinios, audiencias', priority: 2 },
  { id: '8', name: 'Legado Deportivo', description: 'Trayectorias y reconocimientos', priority: 3 },
];

export const mockEntities: Entity[] = [
  { id: '1', name: 'OpenAI', type: 'company', aliases: ['ChatGPT', 'GPT'] },
  { id: '2', name: 'Google', type: 'company', aliases: ['Alphabet', 'DeepMind'] },
  { id: '3', name: 'Elon Musk', type: 'person', aliases: ['Musk'] },
  { id: '4', name: 'Rafael Nadal', type: 'person', aliases: ['Nadal', 'Rafa'] },
  { id: '5', name: 'Roger Federer', type: 'person', aliases: ['Federer', 'Roger'] },
  { id: '6', name: 'Carlos Alcaraz', type: 'person', aliases: ['Alcaraz', 'Carlitos'] },
  { id: '7', name: 'RTVE', type: 'company', aliases: ['TVE', 'La 1'] },
  { id: '8', name: 'Mediapro', type: 'company', aliases: ['Grupo Mediapro'] },
  { id: '9', name: 'FIFA', type: 'organization', aliases: [] },
];

export const mockSources: Source[] = [
  { id: '1', name: 'El País', url: 'https://elpais.com', reliability: 90, category: 'Nacional' },
  { id: '2', name: 'Financial Times', url: 'https://ft.com', reliability: 95, category: 'Internacional' },
  { id: '3', name: 'TechCrunch', url: 'https://techcrunch.com', reliability: 85, category: 'Tecnología' },
  { id: '4', name: 'Olympics.com', url: 'https://olympics.com', reliability: 95, category: 'Deportes' },
  { id: '5', name: 'RTVE', url: 'https://rtve.es', reliability: 90, category: 'Nacional' },
  { id: '6', name: 'MARCA', url: 'https://marca.com', reliability: 85, category: 'Deportes' },
];

export const mockKeywords: Keyword[] = [
  { id: '1', term: 'inteligencia artificial', type: 'impact', weight: 10 },
  { id: '2', term: 'startup', type: 'impact', weight: 8 },
  { id: '3', term: 'polémica', type: 'negative', weight: -5 },
  { id: '4', term: 'escándalo', type: 'negative', weight: -10 },
  { id: '5', term: 'legado', type: 'impact', weight: 8 },
  { id: '6', term: 'derechos TV', type: 'impact', weight: 9 },
  { id: '7', term: 'Mundial', type: 'impact', weight: 10 },
];

export const mockNewsItems: NewsItem[] = [
  // === NOTICIAS EDITORIALES SEMANA 28 ENE 2026 ===
  {
    id: 'news-nadal-legends',
    url: 'https://www.olympics.com/en/news/rafael-nadal-back-on-court-to-headline-night-of-legends-at-australian-open-2026',
    title: 'Rafael Nadal regresa a la pista en la "Night of Legends" del Open de Australia 2026',
    source: 'Olympics.com',
    publishedAt: new Date('2026-01-19T17:31:00'),
    capturedAt: new Date('2026-01-20T10:00:00'),
    summary: 'Nadal encabezará la "Night of Legends" en Melbourne, apenas días después de que Roger Federer protagonizara un partido de exhibición en el mismo escenario. El evento celebra a las figuras históricas del tenis.',
    keyPoints: [
      'Nadal protagoniza el evento "Night of Legends" en el Open de Australia',
      'Federer hizo lo mismo días antes en Melbourne',
      'El tenis capitaliza el legado de la "era dorada" como nuevo formato de contenido',
      'Alcaraz busca su primer Open de Australia, el único Grand Slam que le falta'
    ],
    verificationRisks: [],
    editorialAngle: 'El adiós de los grandes se ha convertido en un nuevo formato de espectáculo. Los Grand Slams entienden el valor del legado para conectar con nuevas generaciones.',
    score: 92,
    topics: ['Tenis', 'Legado Deportivo'],
    entities: ['Rafael Nadal', 'Roger Federer', 'Carlos Alcaraz'],
    status: 'ready'
  },
  {
    id: 'news-mundial-rtve',
    url: 'https://www.rtve.es/rtve/20250910/rtve-adquiere-derechos-para-emision-copa-del-mundo-2026/16723457.shtml',
    title: 'RTVE emitirá el Mundial 2026 en abierto + Mediapro ofrecerá canal exclusivo 24/7',
    source: 'RTVE',
    publishedAt: new Date('2026-01-15T12:00:00'),
    capturedAt: new Date('2026-01-20T11:00:00'),
    summary: 'RTVE ha cerrado el acuerdo con la FIFA para emitir al menos un partido por jornada del Mundial 2026, incluidos todos los de la selección española. Mediapro lanzará un canal temático 24 horas.',
    keyPoints: [
      'RTVE emitirá al menos 1 partido por jornada + todos los de España',
      'Mediapro lanzará canal exclusivo 24h durante el torneo',
      'Primer Mundial con 48 selecciones (EE.UU., México, Canadá)',
      'Modelo híbrido: TV abierta + oferta premium conviven'
    ],
    verificationRisks: [],
    editorialAngle: 'En plena era de fragmentación de derechos y streaming de pago, que el mayor evento del fútbol sea accesible en abierto es noticia relevante para millones de aficionados.',
    score: 88,
    topics: ['Fútbol', 'Industria Deportiva'],
    entities: ['RTVE', 'Mediapro', 'FIFA'],
    status: 'ready'
  },
  // === NOTICIAS ANTERIORES (DEMO) ===
  {
    id: '1',
    url: 'https://example.com/news/1',
    title: 'OpenAI presenta su nuevo modelo GPT-5 con capacidades revolucionarias',
    source: 'TechCrunch',
    publishedAt: new Date('2024-01-20T10:00:00'),
    capturedAt: new Date('2024-01-20T10:30:00'),
    summary: 'OpenAI ha anunciado el lanzamiento de GPT-5, su modelo de lenguaje más avanzado hasta la fecha, con mejoras significativas en razonamiento y creatividad.',
    keyPoints: [
      'Capacidad de razonamiento mejorada en un 40%',
      'Nuevo sistema de memoria a largo plazo',
      'Disponible inicialmente para empresas'
    ],
    verificationRisks: [
      'Cifras de rendimiento pendientes de verificación independiente'
    ],
    editorialAngle: 'El impacto de la IA generativa en la transformación empresarial y la necesidad de adaptación del liderazgo.',
    score: 92,
    topics: ['Innovación', 'Economía Digital'],
    entities: ['OpenAI'],
    status: 'ready'
  },
  {
    id: '2',
    url: 'https://example.com/news/2',
    title: 'España lidera la inversión en energías renovables en Europa',
    source: 'El País',
    publishedAt: new Date('2024-01-20T08:00:00'),
    capturedAt: new Date('2024-01-20T09:00:00'),
    summary: 'Según el último informe de la Agencia Internacional de Energía, España se ha convertido en el principal destino de inversión en renovables de la UE.',
    keyPoints: [
      'Inversión de 15.000 millones de euros en 2023',
      'Liderazgo en energía solar fotovoltaica',
      'Creación de 50.000 nuevos empleos verdes'
    ],
    verificationRisks: [],
    editorialAngle: 'Oportunidades de liderazgo empresarial en la transición energética.',
    score: 78,
    topics: ['Sostenibilidad', 'Economía Digital'],
    entities: [],
    status: 'ready'
  },
  {
    id: '3',
    url: 'https://example.com/news/3',
    title: 'El CEO de Microsoft habla sobre el futuro del trabajo híbrido',
    source: 'Financial Times',
    publishedAt: new Date('2024-01-19T14:00:00'),
    capturedAt: new Date('2024-01-19T15:00:00'),
    summary: 'Satya Nadella comparte su visión sobre cómo las empresas deben adaptar su cultura organizacional al nuevo paradigma laboral.',
    keyPoints: [
      'Flexibilidad como valor competitivo',
      'Inversión en herramientas de colaboración',
      'Medición por resultados, no presencialismo'
    ],
    verificationRisks: [
      'Declaraciones en contexto de promoción de productos Microsoft'
    ],
    editorialAngle: 'Lecciones de liderazgo adaptativo para directivos españoles.',
    score: 65,
    topics: ['Liderazgo', 'Innovación'],
    entities: [],
    status: 'new'
  },
  {
    id: '4',
    url: 'https://example.com/news/4',
    title: 'Nueva regulación europea sobre inteligencia artificial entra en vigor',
    source: 'El País',
    publishedAt: new Date('2024-01-18T12:00:00'),
    capturedAt: new Date('2024-01-18T13:00:00'),
    summary: 'La UE implementa el primer marco regulatorio integral para IA, estableciendo requisitos de transparencia y responsabilidad.',
    keyPoints: [
      'Clasificación de riesgo para sistemas de IA',
      'Multas de hasta 35 millones de euros',
      'Periodo de adaptación de 2 años'
    ],
    verificationRisks: [],
    editorialAngle: 'Cómo preparar tu empresa para el cumplimiento normativo en IA.',
    score: 88,
    topics: ['Innovación', 'Economía Digital'],
    entities: [],
    status: 'processing'
  }
];

// === CONTENIDO EDITORIAL: VARIANTES DE POSTS ===

// TEMA A: NADAL - LINKEDIN
const nadalLinkedinV1 = `Rafa Nadal vuelve a pisar una pista de Grand Slam.

A pocos días de que Roger Federer protagonizara un partido de exhibición en Melbourne, Nadal encabezará la "Night of Legends" en el Open de Australia.

Tres claves:
– No es un regreso competitivo, pero sí simbólico: el adiós de dos gigantes sigue generando narrativa (y negocio).
– Los Grand Slams entienden el valor del legado: estos eventos conectan con nuevas generaciones.
– El paso de testigo está en marcha: Alcaraz, Sinner y compañía heredan un deporte más global que nunca.

¿Veremos más "noches de leyendas" en otros deportes?

#Tenis #OpenDeAustralia #Nadal`;

const nadalLinkedinV2 = `Nadal regresa a Melbourne Park para la "Night of Legends" del Open de Australia 2026.

Apenas unos días después de que Federer disputara un partido de exhibición en el mismo escenario, Nadal protagonizará el evento que homenajea a las figuras históricas del tenis.

Datos de contexto:
– El Open de Australia es el único Grand Slam que Nadal ganó en dos ocasiones (2009, 2022).
– Federer y Nadal acumulan 42 títulos de Grand Slam entre ambos.
– El evento forma parte de la estrategia de Tennis Australia para capitalizar el legado de la "era dorada".

Los grandes torneos han aprendido que el retiro de los mitos no es un final, sino un nuevo formato de contenido.

¿Qué otros deportes deberían explorar este modelo?

#Tenis #Nadal #Legado`;

const nadalLinkedinV3 = `Hay regresos que no se miden en puntos.

Rafa Nadal vuelve a pisar Melbourne. No para competir, sino para recibir el cariño de una afición que lo vio ganar, sufrir y levantarse durante dos décadas.

Días antes, Federer hizo lo mismo. Dos rivales. Dos amigos. Dos formas de decir adiós que, curiosamente, se parecen mucho.

El tenis cierra un capítulo, pero no cierra el libro. Alcaraz ya está escribiendo el siguiente.

A veces, lo más valioso de un campeón no es lo que ganó, sino lo que dejó.

#Nadal #Tenis #OpenDeAustralia`;

// TEMA A: NADAL - TWITTER/X
const nadalTwitterV1 = `Nadal vuelve a pisar Melbourne. Esta vez, en la "Night of Legends".

Días después de Federer, el mensaje es claro: el legado vende y los Grand Slams lo saben explotar.

¿El adiós de los grandes se ha convertido en un nuevo formato de espectáculo?`;

const nadalTwitterV2 = `Nadal encabezará la "Night of Legends" en el Open de Australia 2026.

Federer ya pasó por Melbourne la semana pasada. Entre ambos: 42 Grand Slams.

El tenis ha entendido que el retiro de sus mitos es contenido, no solo despedida.`;

const nadalTwitterV3 = `Nadal vuelve a Melbourne.

No a competir. A recibir lo que siempre dio: entrega, respeto, ejemplo.

A veces el aplauso más largo llega cuando ya no hay raqueta en la mano.`;

// TEMA A: NADAL - FACEBOOK
const nadalFacebookV1 = `Rafa Nadal regresa a la pista del Open de Australia.

No será para competir, sino para protagonizar la "Night of Legends", un evento que celebra a las grandes figuras del tenis. Días antes, Roger Federer hizo lo mismo.

El mensaje es evidente: el legado de estos dos campeones sigue generando interés, emoción y, claro, negocio para los organizadores.

Ahora toca disfrutar de la nueva generación: Alcaraz busca su primer Open de Australia.

#Nadal #Tenis #OpenDeAustralia`;

const nadalFacebookV2 = `El Open de Australia 2026 tendrá un invitado especial: Rafa Nadal.

El español protagonizará la "Night of Legends", el evento que reúne a las leyendas del tenis. Roger Federer ya pasó por Melbourne hace unos días en un partido de exhibición.

Entre ambos suman 42 títulos de Grand Slam y más de 20 años de rivalidad. El tenis aprovecha su legado para conectar con nuevas generaciones de aficionados.

Mientras tanto, Carlos Alcaraz debuta hoy buscando el único grande que le falta.

#Nadal #OpenDeAustralia #Tenis`;

const nadalFacebookV3 = `Hay despedidas que duran años. Y está bien que así sea.

Rafa Nadal vuelve a Melbourne. Esta vez sin raqueta en mano, pero con el mismo respeto de siempre.

La "Night of Legends" del Open de Australia lo recibirá como lo que es: una leyenda.

Días antes, Federer hizo lo mismo. Dos rivales, dos amigos, dos formas de decir gracias al tenis.

El relevo ya está en marcha. Pero algunos aplausos merecen durar un poco más.

#Nadal #Tenis`;

// TEMA B: MUNDIAL RTVE - LINKEDIN
const mundialLinkedinV1 = `El Mundial de fútbol 2026 se verá en abierto en España.

RTVE ha cerrado el acuerdo con la FIFA para emitir al menos un partido por jornada, incluidos todos los de la selección española. Además, Mediapro lanzará un canal exclusivo 24 horas.

Tres lecturas:
– Acceso universal: en un contexto de fragmentación de derechos, que el mayor evento esté en abierto es relevante.
– Modelo híbrido: TV tradicional + oferta premium conviven.
– Oportunidad para anunciantes: un canal 24/7 abre nuevas ventanas publicitarias.

¿Seguirán otros grandes eventos el mismo camino o la tendencia es hacia más fragmentación?

#Mundial2026 #DerechosTV #Fútbol`;

const mundialLinkedinV2 = `RTVE emitirá el Mundial de fútbol 2026 en abierto.

El acuerdo con la FIFA incluye al menos un partido por jornada de la fase de grupos y todos los de España. Además, Mediapro ofrecerá un canal temático 24 horas durante el torneo.

Contexto:
– El Mundial 2026 será el primero con 48 selecciones y se disputará en tres países (EE.UU., México, Canadá).
– Los partidos de España en horario europeo (madrugada en algunos casos) hacen clave la emisión en abierto.
– El modelo híbrido (abierto + premium) busca maximizar audiencia y monetización.

¿Veremos este modelo replicado en otros grandes eventos como la Eurocopa o los Juegos Olímpicos?

#Mundial2026 #RTVE #DerechosTV`;

const mundialLinkedinV3 = `Hay cosas que deberían verse en familia.

El Mundial de fútbol es una de ellas. Y en 2026, España podrá hacerlo: RTVE emitirá el torneo en abierto.

En tiempos de plataformas, contraseñas y suscripciones, que el mayor evento del fútbol sea accesible para todos es una buena noticia.

No es nostalgia. Es entender que algunos momentos deportivos merecen ser compartidos sin barreras.

#Mundial2026 #Fútbol #RTVE`;

// TEMA B: MUNDIAL RTVE - TWITTER/X
const mundialTwitterV1 = `El Mundial 2026 se verá en abierto en España (RTVE).

Mediapro añadirá un canal 24/7 exclusivo.

En plena era del streaming de pago, que el mayor evento del fútbol sea accesible para todos es noticia. ¿Excepción o tendencia?`;

const mundialTwitterV2 = `RTVE emitirá el Mundial 2026: al menos 1 partido/jornada + todos los de España.

Mediapro lanzará un canal 24h dedicado al torneo.

Primer Mundial de 48 selecciones. Tres países sede. Y en España, en abierto.`;

const mundialTwitterV3 = `El Mundial en familia. Sin buscar contraseñas.

RTVE emitirá el Mundial 2026 en abierto.

A veces, las mejores noticias son las más sencillas.`;

// TEMA B: MUNDIAL RTVE - FACEBOOK
const mundialFacebookV1 = `El Mundial de fútbol 2026 se podrá ver en abierto en España.

RTVE ha llegado a un acuerdo con la FIFA para emitir un partido por jornada, incluyendo todos los de la selección española. Además, Mediapro ofrecerá un canal exclusivo 24 horas.

En tiempos de fragmentación de derechos y plataformas de pago, que el evento más grande del fútbol sea accesible es una buena noticia.

#Mundial2026 #Fútbol #RTVE`;

const mundialFacebookV2 = `RTVE ha cerrado el acuerdo para emitir el Mundial de fútbol 2026 en abierto.

El torneo, que se disputará en Estados Unidos, México y Canadá, será el primero con 48 selecciones. España podrá seguir todos los partidos de la Roja sin coste adicional.

Además, Mediapro lanzará un canal temático 24 horas durante la competición.

Un modelo híbrido que busca combinar acceso masivo con oferta premium.

#Mundial2026 #RTVE #Fútbol`;

const mundialFacebookV3 = `Hay veranos que se recuerdan por un gol, un grito y un sofá compartido.

El Mundial 2026 se verá en abierto en España. RTVE lo ha conseguido.

En un mundo de suscripciones y pantallas individuales, poder ver el fútbol en familia sigue teniendo valor.

A veces lo importante no es solo el partido, sino con quién lo ves.

#Mundial2026 #Fútbol`;

export const mockDrafts: PostDraft[] = [
  // === TEMA A: NADAL - LINKEDIN (3 variantes) ===
  {
    id: 'draft-nadal-linkedin-v1',
    newsItemId: 'news-nadal-legends',
    platform: 'linkedin',
    variant: 1,
    content: nadalLinkedinV1,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-nadal-linkedin-v2',
    newsItemId: 'news-nadal-legends',
    platform: 'linkedin',
    variant: 2,
    content: nadalLinkedinV2,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-nadal-linkedin-v3',
    newsItemId: 'news-nadal-legends',
    platform: 'linkedin',
    variant: 3,
    content: nadalLinkedinV3,
    status: 'approved',
    scheduledAt: new Date('2026-01-28T08:30:00'),
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T12:00:00')
  },
  // === TEMA A: NADAL - TWITTER (3 variantes) ===
  {
    id: 'draft-nadal-twitter-v1',
    newsItemId: 'news-nadal-legends',
    platform: 'twitter',
    variant: 1,
    content: nadalTwitterV1,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-nadal-twitter-v2',
    newsItemId: 'news-nadal-legends',
    platform: 'twitter',
    variant: 2,
    content: nadalTwitterV2,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-nadal-twitter-v3',
    newsItemId: 'news-nadal-legends',
    platform: 'twitter',
    variant: 3,
    content: nadalTwitterV3,
    status: 'approved',
    scheduledAt: new Date('2026-01-28T13:00:00'),
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T12:00:00')
  },
  // === TEMA A: NADAL - FACEBOOK (3 variantes) ===
  {
    id: 'draft-nadal-facebook-v1',
    newsItemId: 'news-nadal-legends',
    platform: 'facebook',
    variant: 1,
    content: nadalFacebookV1,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-nadal-facebook-v2',
    newsItemId: 'news-nadal-legends',
    platform: 'facebook',
    variant: 2,
    content: nadalFacebookV2,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-nadal-facebook-v3',
    newsItemId: 'news-nadal-legends',
    platform: 'facebook',
    variant: 3,
    content: nadalFacebookV3,
    status: 'approved',
    scheduledAt: new Date('2026-01-28T20:00:00'),
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T12:00:00')
  },
  // === TEMA B: MUNDIAL RTVE - LINKEDIN (3 variantes) ===
  {
    id: 'draft-mundial-linkedin-v1',
    newsItemId: 'news-mundial-rtve',
    platform: 'linkedin',
    variant: 1,
    content: mundialLinkedinV1,
    status: 'approved',
    scheduledAt: new Date('2026-01-30T08:15:00'),
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T12:00:00')
  },
  {
    id: 'draft-mundial-linkedin-v2',
    newsItemId: 'news-mundial-rtve',
    platform: 'linkedin',
    variant: 2,
    content: mundialLinkedinV2,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-mundial-linkedin-v3',
    newsItemId: 'news-mundial-rtve',
    platform: 'linkedin',
    variant: 3,
    content: mundialLinkedinV3,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  // === TEMA B: MUNDIAL RTVE - TWITTER (3 variantes) ===
  {
    id: 'draft-mundial-twitter-v1',
    newsItemId: 'news-mundial-rtve',
    platform: 'twitter',
    variant: 1,
    content: mundialTwitterV1,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-mundial-twitter-v2',
    newsItemId: 'news-mundial-rtve',
    platform: 'twitter',
    variant: 2,
    content: mundialTwitterV2,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-mundial-twitter-v3',
    newsItemId: 'news-mundial-rtve',
    platform: 'twitter',
    variant: 3,
    content: mundialTwitterV3,
    status: 'approved',
    scheduledAt: new Date('2026-01-30T21:30:00'),
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T12:00:00')
  },
  // === TEMA B: MUNDIAL RTVE - FACEBOOK (3 variantes) ===
  {
    id: 'draft-mundial-facebook-v1',
    newsItemId: 'news-mundial-rtve',
    platform: 'facebook',
    variant: 1,
    content: mundialFacebookV1,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-mundial-facebook-v2',
    newsItemId: 'news-mundial-rtve',
    platform: 'facebook',
    variant: 2,
    content: mundialFacebookV2,
    status: 'pending',
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T10:00:00')
  },
  {
    id: 'draft-mundial-facebook-v3',
    newsItemId: 'news-mundial-rtve',
    platform: 'facebook',
    variant: 3,
    content: mundialFacebookV3,
    status: 'approved',
    scheduledAt: new Date('2026-01-31T12:30:00'),
    createdAt: new Date('2026-01-23T10:00:00'),
    updatedAt: new Date('2026-01-23T12:00:00')
  },
  // === DRAFTS ANTERIORES (DEMO) ===
  {
    id: '1',
    newsItemId: '1',
    platform: 'linkedin',
    variant: 1,
    content: '🚀 OpenAI acaba de presentar GPT-5, y las implicaciones para el mundo empresarial son enormes.\n\nTres claves que todo líder debería considerar:\n\n1️⃣ El razonamiento mejorado cambiará cómo tomamos decisiones estratégicas\n2️⃣ La memoria a largo plazo permitirá asistentes verdaderamente personalizados\n3️⃣ Las empresas que adopten primero tendrán ventaja competitiva\n\n¿Está tu organización preparada para esta nueva era?\n\n#IA #Liderazgo #TransformaciónDigital',
    status: 'pending',
    createdAt: new Date('2024-01-20T11:00:00'),
    updatedAt: new Date('2024-01-20T11:00:00')
  },
  {
    id: '2',
    newsItemId: '1',
    platform: 'twitter',
    variant: 1,
    content: 'GPT-5 ya está aquí. 🧵 Lo que significa para tu empresa:\n\n→ 40% mejor razonamiento\n→ Memoria persistente\n→ Primero empresas, luego consumidores\n\nLa pregunta no es si adoptar IA, sino cuándo.\n\n¿Estás listo?',
    status: 'reviewed',
    createdAt: new Date('2024-01-20T11:00:00'),
    updatedAt: new Date('2024-01-20T12:00:00')
  },
  {
    id: '3',
    newsItemId: '2',
    platform: 'linkedin',
    variant: 1,
    content: '🌱 España lidera la inversión en renovables en Europa.\n\n15.000 millones de euros. 50.000 nuevos empleos.\n\nEsto no es solo una noticia medioambiental. Es una oportunidad de liderazgo empresarial:\n\n• Nuevos modelos de negocio\n• Talento especializado\n• Ventaja competitiva sostenible\n\nLa transición energética es también una transición de liderazgo.\n\n#Sostenibilidad #Liderazgo #España',
    status: 'approved',
    scheduledAt: new Date('2024-01-21T09:00:00'),
    createdAt: new Date('2024-01-20T10:00:00'),
    updatedAt: new Date('2024-01-20T14:00:00')
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  // === CALENDARIO EDITORIAL SEMANA 28 ENE 2026 ===
  // Tema A: Nadal
  {
    id: 'cal-nadal-linkedin',
    postId: 'draft-nadal-linkedin-v3',
    platform: 'linkedin',
    scheduledAt: new Date('2026-01-28T08:30:00'),
    title: 'Nadal: Night of Legends',
    status: 'approved'
  },
  {
    id: 'cal-nadal-twitter',
    postId: 'draft-nadal-twitter-v3',
    platform: 'twitter',
    scheduledAt: new Date('2026-01-28T13:00:00'),
    title: 'Nadal: Night of Legends',
    status: 'approved'
  },
  {
    id: 'cal-nadal-facebook',
    postId: 'draft-nadal-facebook-v3',
    platform: 'facebook',
    scheduledAt: new Date('2026-01-28T20:00:00'),
    title: 'Nadal: Night of Legends',
    status: 'approved'
  },
  // Tema B: Mundial RTVE
  {
    id: 'cal-mundial-linkedin',
    postId: 'draft-mundial-linkedin-v1',
    platform: 'linkedin',
    scheduledAt: new Date('2026-01-30T08:15:00'),
    title: 'Mundial 2026 en abierto',
    status: 'approved'
  },
  {
    id: 'cal-mundial-twitter',
    postId: 'draft-mundial-twitter-v3',
    platform: 'twitter',
    scheduledAt: new Date('2026-01-30T21:30:00'),
    title: 'Mundial 2026 en abierto',
    status: 'approved'
  },
  {
    id: 'cal-mundial-facebook',
    postId: 'draft-mundial-facebook-v3',
    platform: 'facebook',
    scheduledAt: new Date('2026-01-31T12:30:00'),
    title: 'Mundial 2026 en abierto',
    status: 'approved'
  },
  // === EVENTOS ANTERIORES (DEMO) ===
  {
    id: '1',
    postId: '3',
    platform: 'linkedin',
    scheduledAt: new Date('2024-01-21T09:00:00'),
    title: 'España lidera renovables',
    status: 'approved'
  },
  {
    id: '2',
    postId: '1',
    platform: 'linkedin',
    scheduledAt: new Date('2024-01-22T10:00:00'),
    title: 'GPT-5 lanzamiento',
    status: 'pending'
  },
  {
    id: '3',
    postId: '2',
    platform: 'twitter',
    scheduledAt: new Date('2024-01-22T12:00:00'),
    title: 'GPT-5 hilo',
    status: 'reviewed'
  }
];
