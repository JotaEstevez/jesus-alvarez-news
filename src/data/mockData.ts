import { NewsItem, PostDraft, Topic, Entity, Source, Keyword, CalendarEvent } from '@/types/newsroom';

export const mockTopics: Topic[] = [
  { id: '1', name: 'Economía Digital', description: 'Transformación digital y economía', priority: 1 },
  { id: '2', name: 'Innovación', description: 'Nuevas tecnologías y startups', priority: 2 },
  { id: '3', name: 'Liderazgo', description: 'Gestión y liderazgo empresarial', priority: 3 },
  { id: '4', name: 'Sostenibilidad', description: 'ESG y responsabilidad corporativa', priority: 4 },
];

export const mockEntities: Entity[] = [
  { id: '1', name: 'OpenAI', type: 'company', aliases: ['ChatGPT', 'GPT'] },
  { id: '2', name: 'Google', type: 'company', aliases: ['Alphabet', 'DeepMind'] },
  { id: '3', name: 'Elon Musk', type: 'person', aliases: ['Musk'] },
];

export const mockSources: Source[] = [
  { id: '1', name: 'El País', url: 'https://elpais.com', reliability: 90, category: 'Nacional' },
  { id: '2', name: 'Financial Times', url: 'https://ft.com', reliability: 95, category: 'Internacional' },
  { id: '3', name: 'TechCrunch', url: 'https://techcrunch.com', reliability: 85, category: 'Tecnología' },
];

export const mockKeywords: Keyword[] = [
  { id: '1', term: 'inteligencia artificial', type: 'impact', weight: 10 },
  { id: '2', term: 'startup', type: 'impact', weight: 8 },
  { id: '3', term: 'polémica', type: 'negative', weight: -5 },
  { id: '4', term: 'escándalo', type: 'negative', weight: -10 },
];

export const mockNewsItems: NewsItem[] = [
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

export const mockDrafts: PostDraft[] = [
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
