import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Topic, Entity, Source, Keyword, NewsItem, PostDraft } from '@/types/newsroom';
import { useToast } from '@/hooks/use-toast';

// Type mappings for database rows
interface DbTopic {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  priority: number;
  created_at: string;
}

interface DbEntity {
  id: string;
  user_id: string;
  name: string;
  type: string;
  aliases: string[] | null;
  created_at: string;
}

interface DbSource {
  id: string;
  user_id: string;
  name: string;
  url: string;
  category: string;
  reliability: number;
  created_at: string;
}

interface DbKeyword {
  id: string;
  user_id: string;
  term: string;
  type: string;
  weight: number;
  created_at: string;
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
  created_at: string;
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

// Convert DB rows to app types
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

export function useSupabaseData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [
        topicsRes,
        entitiesRes,
        sourcesRes,
        keywordsRes,
        newsRes,
        draftsRes
      ] = await Promise.all([
        supabase.from('topics').select('*').order('priority'),
        supabase.from('entities').select('*').order('name'),
        supabase.from('sources').select('*').order('name'),
        supabase.from('keywords').select('*').order('term'),
        supabase.from('news_items').select('*').order('captured_at', { ascending: false }),
        supabase.from('post_drafts').select('*').order('created_at', { ascending: false }),
      ]);

      if (topicsRes.data) setTopics(topicsRes.data.map(toTopic));
      if (entitiesRes.data) setEntities(entitiesRes.data.map(toEntity));
      if (sourcesRes.data) setSources(sourcesRes.data.map(toSource));
      if (keywordsRes.data) setKeywords(keywordsRes.data.map(toKeyword));
      if (newsRes.data) setNewsItems(newsRes.data.map(toNewsItem));
      if (draftsRes.data) setDrafts(draftsRes.data.map(toPostDraft));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // TOPICS CRUD
  const saveTopic = async (topic: Omit<Topic, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (topic.id) {
      const { error } = await supabase
        .from('topics')
        .update({ name: topic.name, description: topic.description, priority: topic.priority })
        .eq('id', topic.id);
      
      if (error) throw error;
      setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, ...topic } : t));
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

  // ENTITIES CRUD
  const saveEntity = async (entity: Omit<Entity, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (entity.id) {
      const { error } = await supabase
        .from('entities')
        .update({ name: entity.name, type: entity.type, aliases: entity.aliases })
        .eq('id', entity.id);
      
      if (error) throw error;
      setEntities(prev => prev.map(e => e.id === entity.id ? { ...e, ...entity } : e));
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

  // SOURCES CRUD
  const saveSource = async (source: Omit<Source, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (source.id) {
      const { error } = await supabase
        .from('sources')
        .update({ name: source.name, url: source.url, category: source.category, reliability: source.reliability })
        .eq('id', source.id);
      
      if (error) throw error;
      setSources(prev => prev.map(s => s.id === source.id ? { ...s, ...source } : s));
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

  // KEYWORDS CRUD
  const saveKeyword = async (keyword: Omit<Keyword, 'id'> & { id?: string }) => {
    if (!user) return;
    
    if (keyword.id) {
      const { error } = await supabase
        .from('keywords')
        .update({ term: keyword.term, type: keyword.type, weight: keyword.weight })
        .eq('id', keyword.id);
      
      if (error) throw error;
      setKeywords(prev => prev.map(k => k.id === keyword.id ? { ...k, ...keyword } : k));
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

  // NEWS ITEMS CRUD
  const saveNewsItem = async (news: Omit<NewsItem, 'id' | 'capturedAt' | 'score'> & { id?: string; score?: number }) => {
    if (!user) return;
    
    const dbData = {
      url: news.url,
      title: news.title,
      source: news.source,
      summary: news.summary,
      key_points: news.keyPoints,
      verification_risks: news.verificationRisks,
      editorial_angle: news.editorialAngle,
      topics: news.topics,
      entities: news.entities,
      score: news.score || 0,
      status: news.status,
      published_at: news.publishedAt?.toISOString(),
    };

    if (news.id) {
      const { error } = await supabase
        .from('news_items')
        .update(dbData)
        .eq('id', news.id);
      
      if (error) throw error;
      setNewsItems(prev => prev.map(n => n.id === news.id ? { ...n, ...news } as NewsItem : n));
    } else {
      const { data, error } = await supabase
        .from('news_items')
        .insert({ ...dbData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      if (data) setNewsItems(prev => [toNewsItem(data), ...prev]);
      return data ? toNewsItem(data) : null;
    }
  };

  const deleteNewsItem = async (id: string) => {
    const { error } = await supabase.from('news_items').delete().eq('id', id);
    if (error) throw error;
    setNewsItems(prev => prev.filter(n => n.id !== id));
  };

  const updateNewsStatus = async (id: string, status: NewsItem['status']) => {
    const { error } = await supabase
      .from('news_items')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    setNewsItems(prev => prev.map(n => n.id === id ? { ...n, status } : n));
  };

  // POST DRAFTS CRUD
  const saveDraft = async (draft: Omit<PostDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!user) return;
    
    const dbData = {
      news_item_id: draft.newsItemId || null,
      platform: draft.platform,
      content: draft.content,
      variant: draft.variant,
      status: draft.status,
      scheduled_at: draft.scheduledAt?.toISOString(),
    };

    if (draft.id) {
      const { data, error } = await supabase
        .from('post_drafts')
        .update(dbData)
        .eq('id', draft.id)
        .select()
        .single();
      
      if (error) throw error;
      if (data) setDrafts(prev => prev.map(d => d.id === draft.id ? toPostDraft(data) : d));
    } else {
      const { data, error } = await supabase
        .from('post_drafts')
        .insert({ ...dbData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      if (data) setDrafts(prev => [toPostDraft(data), ...prev]);
      return data ? toPostDraft(data) : null;
    }
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from('post_drafts').delete().eq('id', id);
    if (error) throw error;
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const updateDraftStatus = async (id: string, status: PostDraft['status']) => {
    const { data, error } = await supabase
      .from('post_drafts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (data) setDrafts(prev => prev.map(d => d.id === id ? toPostDraft(data) : d));
  };

  const scheduleDraft = async (id: string, scheduledAt: Date) => {
    const { data, error } = await supabase
      .from('post_drafts')
      .update({ scheduled_at: scheduledAt.toISOString(), status: 'scheduled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (data) setDrafts(prev => prev.map(d => d.id === id ? toPostDraft(data) : d));
  };

  // Helper functions
  const getNewsById = (id: string) => newsItems.find(n => n.id === id);
  const getDraftsForNews = (newsId: string) => drafts.filter(d => d.newsItemId === newsId);

  return {
    loading,
    // Data
    topics,
    entities,
    sources,
    keywords,
    newsItems,
    drafts,
    // Topics
    saveTopic,
    deleteTopic,
    // Entities
    saveEntity,
    deleteEntity,
    // Sources
    saveSource,
    deleteSource,
    // Keywords
    saveKeyword,
    deleteKeyword,
    // News
    saveNewsItem,
    deleteNewsItem,
    updateNewsStatus,
    getNewsById,
    // Drafts
    saveDraft,
    deleteDraft,
    updateDraftStatus,
    scheduleDraft,
    getDraftsForNews,
    // Reload
    reload: loadData,
  };
}
