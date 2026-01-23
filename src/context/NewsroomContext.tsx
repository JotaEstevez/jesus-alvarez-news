import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { NewsItem, PostDraft, CalendarEvent, Topic, Entity, Source, Keyword, Platform, PostStatus } from '@/types/newsroom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Database row types
interface DbTopic {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  priority: number;
}

interface DbEntity {
  id: string;
  user_id: string;
  name: string;
  type: string;
  aliases: string[] | null;
}

interface DbSource {
  id: string;
  user_id: string;
  name: string;
  url: string;
  category: string;
  reliability: number;
}

interface DbKeyword {
  id: string;
  user_id: string;
  term: string;
  type: string;
  weight: number;
}

interface DbNewsItem {
  id: string;
  user_id: string;
  url: string;
  title: string;
  source: string;
  summary: string | null;
  key_points: string[] | null;
  verification_risks: string[] | null;
  editorial_angle: string | null;
  topics: string[] | null;
  entities: string[] | null;
  score: number;
  status: string;
  published_at: string | null;
  captured_at: string;
}

interface DbPostDraft {
  id: string;
  user_id: string;
  news_item_id: string | null;
  platform: string;
  content: string;
  variant: number;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Converters
const toTopic = (row: DbTopic): Topic => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  priority: row.priority,
});

const toEntity = (row: DbEntity): Entity => ({
  id: row.id,
  name: row.name,
  type: row.type as 'person' | 'company' | 'organization',
  aliases: row.aliases || [],
});

const toSource = (row: DbSource): Source => ({
  id: row.id,
  name: row.name,
  url: row.url,
  category: row.category,
  reliability: row.reliability,
});

const toKeyword = (row: DbKeyword): Keyword => ({
  id: row.id,
  term: row.term,
  type: row.type as 'impact' | 'negative',
  weight: row.weight,
});

const toNewsItem = (row: DbNewsItem): NewsItem => ({
  id: row.id,
  url: row.url,
  title: row.title,
  source: row.source,
  summary: row.summary || '',
  keyPoints: row.key_points || [],
  verificationRisks: row.verification_risks || [],
  editorialAngle: row.editorial_angle || '',
  topics: row.topics || [],
  entities: row.entities || [],
  score: row.score,
  status: row.status as NewsItem['status'],
  publishedAt: row.published_at ? new Date(row.published_at) : undefined,
  capturedAt: new Date(row.captured_at),
});

const toPostDraft = (row: DbPostDraft): PostDraft => ({
  id: row.id,
  newsItemId: row.news_item_id || '',
  platform: row.platform as PostDraft['platform'],
  content: row.content,
  variant: row.variant as 1 | 2 | 3,
  status: row.status as PostDraft['status'],
  scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

interface NewsroomContextType {
  loading: boolean;
  error: string | null;
  dataLoaded: boolean;
  // News
  newsItems: NewsItem[];
  addNewsItem: (news: Omit<NewsItem, 'id' | 'capturedAt' | 'score'>) => Promise<void>;
  updateNewsItem: (id: string, updates: Partial<NewsItem>) => Promise<void>;
  deleteNewsItem: (id: string) => Promise<void>;
  markNewsAsReady: (id: string) => Promise<void>;
  getReadyNews: () => NewsItem[];
  
  // Drafts
  drafts: PostDraft[];
  addDraft: (draft: Omit<PostDraft, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PostDraft | null>;
  updateDraft: (id: string, updates: Partial<PostDraft>) => Promise<void>;
  updateDraftStatus: (id: string, status: PostStatus) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  scheduleDraft: (id: string, scheduledAt: Date) => Promise<void>;
  generateDraftsForNews: (newsId: string) => void;
  getDraftsForNews: (newsId: string) => PostDraft[];
  
  // Calendar Events (derived from drafts with scheduledAt)
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  
  // Configuration
  topics: Topic[];
  entities: Entity[];
  sources: Source[];
  keywords: Keyword[];
  saveTopic: (topic: Omit<Topic, 'id'> & { id?: string }) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  saveEntity: (entity: Omit<Entity, 'id'> & { id?: string }) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  saveSource: (source: Omit<Source, 'id'> & { id?: string }) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  saveKeyword: (keyword: Omit<Keyword, 'id'> & { id?: string }) => Promise<void>;
  deleteKeyword: (id: string) => Promise<void>;
  
  // Legacy setters for compatibility
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  setKeywords: React.Dispatch<React.SetStateAction<Keyword[]>>;
  
  // Utilities
  calculateScore: (news: Partial<NewsItem>) => number;
  getNewsById: (id: string) => NewsItem | undefined;
  reload: () => Promise<void>;
}

const NewsroomContext = createContext<NewsroomContextType | null>(null);

export function NewsroomProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // State
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  // Derive calendar events from scheduled drafts
  const calendarEvents: CalendarEvent[] = drafts
    .filter(d => d.scheduledAt)
    .map(d => {
      const news = newsItems.find(n => n.id === d.newsItemId);
      return {
        id: d.id,
        postId: d.id,
        platform: d.platform,
        scheduledAt: d.scheduledAt!,
        title: news?.title.substring(0, 50) || 'Post',
        status: d.status,
      };
    });

  // Load all data from Supabase
  const loadData = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[NewsroomContext] Waiting for auth...');
      return;
    }
    
    if (!user) {
      console.log('[NewsroomContext] No user, skipping data load');
      setLoading(false);
      setDataLoaded(false);
      return;
    }
    
    console.log('[NewsroomContext] Loading data for user:', user.id);
    setLoading(true);
    setError(null);
    
    try {
      const [topicsRes, entitiesRes, sourcesRes, keywordsRes, newsRes, draftsRes] = await Promise.all([
        supabase.from('topics').select('*').order('priority'),
        supabase.from('entities').select('*').order('name'),
        supabase.from('sources').select('*').order('name'),
        supabase.from('keywords').select('*').order('term'),
        supabase.from('news_items').select('*').order('captured_at', { ascending: false }),
        supabase.from('post_drafts').select('*').order('created_at', { ascending: false }),
      ]);

      // Check for errors
      const errors = [topicsRes.error, entitiesRes.error, sourcesRes.error, keywordsRes.error, newsRes.error, draftsRes.error].filter(Boolean);
      if (errors.length > 0) {
        console.error('[NewsroomContext] Supabase errors:', errors);
        setError('Error al cargar datos de Supabase');
        toast({
          title: 'Error de conexión',
          description: 'No se pudieron cargar algunos datos. Verifica tu conexión.',
          variant: 'destructive',
        });
      }

      console.log('[NewsroomContext] Data loaded:', {
        topics: topicsRes.data?.length || 0,
        entities: entitiesRes.data?.length || 0,
        sources: sourcesRes.data?.length || 0,
        keywords: keywordsRes.data?.length || 0,
        news: newsRes.data?.length || 0,
        drafts: draftsRes.data?.length || 0,
      });

      if (topicsRes.data) setTopics(topicsRes.data.map(toTopic));
      if (entitiesRes.data) setEntities(entitiesRes.data.map(toEntity));
      if (sourcesRes.data) setSources(sourcesRes.data.map(toSource));
      if (keywordsRes.data) setKeywords(keywordsRes.data.map(toKeyword));
      if (newsRes.data) setNewsItems(newsRes.data.map(toNewsItem));
      if (draftsRes.data) setDrafts(draftsRes.data.map(toPostDraft));
      
      setDataLoaded(true);
    } catch (err) {
      console.error('[NewsroomContext] Error loading data:', err);
      setError('Error de conexión con Supabase');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, toast]);

  // Load data when user changes or auth finishes loading
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate score
  const calculateScore = useCallback((news: Partial<NewsItem>): number => {
    let score = 50;
    const content = `${news.title || ''} ${news.summary || ''}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (content.includes(keyword.term.toLowerCase())) {
        score += keyword.weight;
      }
    });
    
    (news.topics || []).forEach(topicName => {
      const topic = topics.find(t => t.name === topicName);
      if (topic) {
        score += (5 - topic.priority) * 5;
      }
    });
    
    const source = sources.find(s => s.name === news.source);
    if (source && source.reliability > 85) {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }, [keywords, topics, sources]);

  // =================== TOPICS ===================
  const saveTopic = async (topic: Omit<Topic, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (topic.id) {
      const { error } = await supabase
        .from('topics')
        .update({ name: topic.name, description: topic.description, priority: topic.priority })
        .eq('id', topic.id);
      if (error) throw error;
      setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, ...topic } as Topic : t));
    } else {
      const { data, error } = await supabase
        .from('topics')
        .insert({ user_id: user.id, name: topic.name, description: topic.description, priority: topic.priority })
        .select()
        .single();
      if (error) throw error;
      if (data) setTopics(prev => [...prev, toTopic(data)]);
    }
  };

  const deleteTopic = async (id: string) => {
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) throw error;
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  // =================== ENTITIES ===================
  const saveEntity = async (entity: Omit<Entity, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (entity.id) {
      const { error } = await supabase
        .from('entities')
        .update({ name: entity.name, type: entity.type, aliases: entity.aliases })
        .eq('id', entity.id);
      if (error) throw error;
      setEntities(prev => prev.map(e => e.id === entity.id ? { ...e, ...entity } as Entity : e));
    } else {
      const { data, error } = await supabase
        .from('entities')
        .insert({ user_id: user.id, name: entity.name, type: entity.type, aliases: entity.aliases })
        .select()
        .single();
      if (error) throw error;
      if (data) setEntities(prev => [...prev, toEntity(data)]);
    }
  };

  const deleteEntity = async (id: string) => {
    const { error } = await supabase.from('entities').delete().eq('id', id);
    if (error) throw error;
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  // =================== SOURCES ===================
  const saveSource = async (source: Omit<Source, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (source.id) {
      const { error } = await supabase
        .from('sources')
        .update({ name: source.name, url: source.url, category: source.category, reliability: source.reliability })
        .eq('id', source.id);
      if (error) throw error;
      setSources(prev => prev.map(s => s.id === source.id ? { ...s, ...source } as Source : s));
    } else {
      const { data, error } = await supabase
        .from('sources')
        .insert({ user_id: user.id, name: source.name, url: source.url, category: source.category, reliability: source.reliability })
        .select()
        .single();
      if (error) throw error;
      if (data) setSources(prev => [...prev, toSource(data)]);
    }
  };

  const deleteSource = async (id: string) => {
    const { error } = await supabase.from('sources').delete().eq('id', id);
    if (error) throw error;
    setSources(prev => prev.filter(s => s.id !== id));
  };

  // =================== KEYWORDS ===================
  const saveKeyword = async (keyword: Omit<Keyword, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (keyword.id) {
      const { error } = await supabase
        .from('keywords')
        .update({ term: keyword.term, type: keyword.type, weight: keyword.weight })
        .eq('id', keyword.id);
      if (error) throw error;
      setKeywords(prev => prev.map(k => k.id === keyword.id ? { ...k, ...keyword } as Keyword : k));
    } else {
      const { data, error } = await supabase
        .from('keywords')
        .insert({ user_id: user.id, term: keyword.term, type: keyword.type, weight: keyword.weight })
        .select()
        .single();
      if (error) throw error;
      if (data) setKeywords(prev => [...prev, toKeyword(data)]);
    }
  };

  const deleteKeyword = async (id: string) => {
    const { error } = await supabase.from('keywords').delete().eq('id', id);
    if (error) throw error;
    setKeywords(prev => prev.filter(k => k.id !== id));
  };

  // =================== NEWS ITEMS ===================
  const addNewsItem = async (news: Omit<NewsItem, 'id' | 'capturedAt' | 'score'>) => {
    if (!user) return;
    
    const score = calculateScore(news);
    const { data, error } = await supabase
      .from('news_items')
      .insert({
        user_id: user.id,
        url: news.url,
        title: news.title,
        source: news.source,
        summary: news.summary,
        key_points: news.keyPoints,
        verification_risks: news.verificationRisks,
        editorial_angle: news.editorialAngle,
        topics: news.topics,
        entities: news.entities,
        score,
        status: news.status,
        published_at: news.publishedAt?.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    if (data) setNewsItems(prev => [toNewsItem(data), ...prev]);
  };

  const updateNewsItem = async (id: string, updates: Partial<NewsItem>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.url !== undefined) dbUpdates.url = updates.url;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
    if (updates.keyPoints !== undefined) dbUpdates.key_points = updates.keyPoints;
    if (updates.verificationRisks !== undefined) dbUpdates.verification_risks = updates.verificationRisks;
    if (updates.editorialAngle !== undefined) dbUpdates.editorial_angle = updates.editorialAngle;
    if (updates.topics !== undefined) dbUpdates.topics = updates.topics;
    if (updates.entities !== undefined) dbUpdates.entities = updates.entities;
    if (updates.score !== undefined) dbUpdates.score = updates.score;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt?.toISOString();

    const { error } = await supabase.from('news_items').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setNewsItems(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNewsItem = async (id: string) => {
    const { error } = await supabase.from('news_items').delete().eq('id', id);
    if (error) throw error;
    setNewsItems(prev => prev.filter(n => n.id !== id));
  };

  const markNewsAsReady = async (id: string) => {
    await updateNewsItem(id, { status: 'ready' });
  };

  const getReadyNews = () => newsItems.filter(n => n.status === 'ready');
  const getNewsById = (id: string) => newsItems.find(n => n.id === id);

  // =================== DRAFTS ===================
  const addDraft = async (draft: Omit<PostDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostDraft | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('post_drafts')
      .insert({
        user_id: user.id,
        news_item_id: draft.newsItemId || null,
        platform: draft.platform,
        content: draft.content,
        variant: draft.variant,
        status: draft.status,
        scheduled_at: draft.scheduledAt?.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    if (data) {
      const newDraft = toPostDraft(data);
      setDrafts(prev => [newDraft, ...prev]);
      return newDraft;
    }
    return null;
  };

  const updateDraft = async (id: string, updates: Partial<PostDraft>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.scheduledAt !== undefined) dbUpdates.scheduled_at = updates.scheduledAt?.toISOString();
    if (updates.variant !== undefined) dbUpdates.variant = updates.variant;

    const { data, error } = await supabase
      .from('post_drafts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (data) setDrafts(prev => prev.map(d => d.id === id ? toPostDraft(data) : d));
  };

  const updateDraftStatus = async (id: string, status: PostStatus) => {
    await updateDraft(id, { status });
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from('post_drafts').delete().eq('id', id);
    if (error) throw error;
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const scheduleDraft = async (id: string, scheduledAt: Date) => {
    await updateDraft(id, { scheduledAt, status: 'scheduled' });
  };

  const getDraftsForNews = (newsId: string) => drafts.filter(d => d.newsItemId === newsId);

  // Generate drafts locally (will be saved when user approves)
  const generateDraftsForNews = (newsId: string) => {
    const news = newsItems.find(n => n.id === newsId);
    if (!news) return;

    const platforms: Platform[] = ['linkedin', 'twitter', 'instagram', 'facebook'];
    const now = new Date();

    const templates: Record<Platform, (n: NewsItem, v: number) => string> = {
      linkedin: (n, v) => v === 1 
        ? `📊 ${n.title}\n\n${n.summary}\n\nPuntos clave:\n${n.keyPoints.map(p => `• ${p}`).join('\n')}\n\n${n.editorialAngle}\n\n#${n.topics.join(' #')}`
        : `🔍 Análisis: ${n.title}\n\n${n.editorialAngle}\n\nLo que esto significa:\n\n${n.keyPoints[0]}\n\n¿Qué opinas?\n\n#${n.topics[0]}`,
      twitter: (n, v) => v === 1
        ? `🧵 ${n.title}\n\n→ ${n.keyPoints[0]}\n→ ${n.keyPoints[1] || ''}\n\n${n.editorialAngle.substring(0, 100)}...`
        : `⚡ ${n.summary.substring(0, 200)}...\n\n#${n.topics[0]}`,
      instagram: (n, v) => v === 1
        ? `✨ ${n.title}\n\n${n.summary}\n\n💡 ${n.editorialAngle}\n\n.\n.\n.\n#${n.topics.join(' #')} #noticias`
        : `📰 ${n.summary}\n\n🔑 ${n.keyPoints[0]}\n\n#${n.topics[0]} #actualidad`,
      facebook: (n, v) => v === 1
        ? `${n.title}\n\n${n.summary}\n\n📌 Puntos clave:\n${n.keyPoints.map(p => `• ${p}`).join('\n')}\n\n💬 ¿Qué opinas sobre esto?`
        : `🗞️ ${n.summary}\n\n${n.editorialAngle}\n\n👉 Lee más en el enlace`,
    };

    platforms.forEach(platform => {
      [1, 2].forEach(variant => {
        const existingDraft = drafts.find(
          d => d.newsItemId === newsId && d.platform === platform && d.variant === variant
        );
        
        if (!existingDraft) {
          const newDraft: PostDraft = {
            id: crypto.randomUUID(),
            newsItemId: newsId,
            platform,
            variant: variant as 1 | 2 | 3,
            content: templates[platform](news, variant),
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          };
          setDrafts(prev => [...prev, newDraft]);
        }
      });
    });
  };

  // =================== CALENDAR ===================
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    // Calendar events are derived from drafts, so we schedule the draft
    if (event.postId) {
      scheduleDraft(event.postId, event.scheduledAt);
    }
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (updates.scheduledAt) {
      await updateDraft(id, { scheduledAt: updates.scheduledAt });
    }
    if (updates.status) {
      await updateDraft(id, { status: updates.status as PostStatus });
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    await updateDraft(id, { scheduledAt: undefined, status: 'pending' });
  };

  return (
    <NewsroomContext.Provider value={{
      loading,
      error,
      dataLoaded,
      newsItems,
      addNewsItem,
      updateNewsItem,
      deleteNewsItem,
      markNewsAsReady,
      getReadyNews,
      drafts,
      addDraft,
      updateDraft,
      updateDraftStatus,
      deleteDraft,
      scheduleDraft,
      generateDraftsForNews,
      getDraftsForNews,
      calendarEvents,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      topics,
      entities,
      sources,
      keywords,
      saveTopic,
      deleteTopic,
      saveEntity,
      deleteEntity,
      saveSource,
      deleteSource,
      saveKeyword,
      deleteKeyword,
      setTopics,
      setEntities,
      setSources,
      setKeywords,
      calculateScore,
      getNewsById,
      reload: loadData,
    }}>
      {children}
    </NewsroomContext.Provider>
  );
}

export function useNewsroom() {
  const context = useContext(NewsroomContext);
  if (!context) {
    throw new Error('useNewsroom must be used within a NewsroomProvider');
  }
  return context;
}
