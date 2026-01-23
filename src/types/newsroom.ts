export type Platform = 'linkedin' | 'twitter' | 'instagram' | 'facebook';

export type PostStatus = 'pending' | 'reviewed' | 'approved' | 'scheduled' | 'rejected' | 'published';

export interface NewsItem {
  id: string;
  url: string;
  title: string;
  source: string;
  publishedAt?: Date;
  capturedAt: Date;
  summary: string;
  keyPoints: string[];
  verificationRisks: string[];
  editorialAngle: string;
  score: number;
  topics: string[];
  entities: string[];
  status: 'new' | 'processing' | 'ready' | 'generating' | 'published' | 'discarded';
}

export interface PostDraft {
  id: string;
  newsItemId: string;
  platform: Platform;
  variant: number;
  content: string;
  status: PostStatus;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  priority: number;
}

export interface Entity {
  id: string;
  name: string;
  type: 'person' | 'company' | 'organization' | 'location';
  aliases: string[];
}

export interface Source {
  id: string;
  name: string;
  url: string;
  reliability: number;
  category: string;
}

export interface Keyword {
  id: string;
  term: string;
  type: 'impact' | 'negative';
  weight: number;
}

export interface ScoringRule {
  id: string;
  name: string;
  condition: string;
  scoreModifier: number;
  active: boolean;
}

export interface CalendarEvent {
  id: string;
  postId: string;
  platform: Platform;
  scheduledAt: Date;
  title: string;
  status: PostStatus;
}

export interface PublicationMetric {
  id: string;
  postId: string;
  platform: Platform;
  publishedAt: Date;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  shares?: number;
  comments?: number;
}
