export type SeedTopic = {
  name: string;
  description?: string;
  priority: number;
};

export type SeedSource = {
  name: string;
  url: string;
  category: string;
  reliability: number;
};

export type SeedEntity = {
  name: string;
  type: 'person' | 'company' | 'organization';
  aliases?: string[];
};

export type SeedKeyword = {
  term: string;
  type: 'impact' | 'negative';
  weight: number;
};

export const INITIAL_SEED = {
  topics: [
    { name: 'Economía Digital', priority: 1 },
    { name: 'Innovación', priority: 2 },
    { name: 'Liderazgo', priority: 3 },
    { name: 'Sostenibilidad', priority: 4 },
    { name: 'Tenis', priority: 1 },
    { name: 'Fútbol', priority: 1 },
    { name: 'Industria Deportiva', priority: 2 },
    { name: 'Legado Deportivo', priority: 3 },
  ] satisfies SeedTopic[],

  sources: [
    { name: 'El País', url: 'https://elpais.com', category: 'Nacional', reliability: 90 },
    { name: 'RTVE', url: 'https://rtve.es', category: 'Nacional', reliability: 90 },
    { name: 'MARCA', url: 'https://marca.com', category: 'Deportes', reliability: 85 },
    { name: 'Olympics.com', url: 'https://olympics.com', category: 'Deportes', reliability: 95 },
    { name: 'AS', url: 'https://as.com', category: 'Deportes', reliability: 85 },
    { name: 'Relevo', url: 'https://relevo.com', category: 'Deportes', reliability: 90 },
  ] satisfies SeedSource[],

  entities: [
    { name: 'Rafael Nadal', type: 'person', aliases: ['Nadal', 'Rafa'] },
    { name: 'Carlos Alcaraz', type: 'person', aliases: ['Alcaraz', 'Carlitos'] },
    { name: 'Roger Federer', type: 'person', aliases: ['Federer'] },
    { name: 'RTVE', type: 'company', aliases: ['TVE', 'La 1'] },
    { name: 'Mediapro', type: 'company', aliases: ['Grupo Mediapro'] },
    { name: 'FIFA', type: 'organization', aliases: [] },
    { name: 'LaLiga', type: 'organization', aliases: [] },
    { name: 'AEPD', type: 'organization', aliases: [] },
  ] satisfies SeedEntity[],

  keywords: [
    // Impacto
    { term: 'inteligencia artificial', type: 'impact', weight: 10 },
    { term: 'startup', type: 'impact', weight: 8 },
    { term: 'legado', type: 'impact', weight: 8 },
    { term: 'derechos TV', type: 'impact', weight: 9 },
    { term: 'Mundial', type: 'impact', weight: 10 },
    { term: 'fichaje', type: 'impact', weight: 8 },
    { term: 'récord', type: 'impact', weight: 9 },
    { term: 'histórico', type: 'impact', weight: 10 },
    { term: 'debut', type: 'impact', weight: 7 },
    { term: 'retirada', type: 'impact', weight: 10 },
    { term: 'audiencia', type: 'impact', weight: 8 },
    // Negativas
    { term: 'polémica', type: 'negative', weight: -5 },
    { term: 'escándalo', type: 'negative', weight: -10 },
    { term: 'rumor', type: 'negative', weight: -7 },
    { term: 'apuestas', type: 'negative', weight: -10 },
  ] satisfies SeedKeyword[],
} as const;
