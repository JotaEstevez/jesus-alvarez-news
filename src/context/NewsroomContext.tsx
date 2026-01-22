import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NewsItem, PostDraft, CalendarEvent, Topic, Entity, Source, Keyword, Platform, PostStatus } from '@/types/newsroom';
import { mockNewsItems, mockDrafts, mockCalendarEvents, mockTopics, mockEntities, mockSources, mockKeywords } from '@/data/mockData';

interface NewsroomContextType {
  // News
  newsItems: NewsItem[];
  addNewsItem: (news: Omit<NewsItem, 'id' | 'capturedAt' | 'score'>) => void;
  updateNewsItem: (id: string, updates: Partial<NewsItem>) => void;
  deleteNewsItem: (id: string) => void;
  markNewsAsReady: (id: string) => void;
  getReadyNews: () => NewsItem[];
  
  // Drafts
  drafts: PostDraft[];
  addDraft: (draft: Omit<PostDraft, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDraft: (id: string, updates: Partial<PostDraft>) => void;
  updateDraftStatus: (id: string, status: PostStatus) => void;
  deleteDraft: (id: string) => void;
  scheduleDraft: (id: string, scheduledAt: Date) => void;
  generateDraftsForNews: (newsId: string) => void;
  getDraftsForNews: (newsId: string) => PostDraft[];
  
  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  
  // Configuration
  topics: Topic[];
  entities: Entity[];
  sources: Source[];
  keywords: Keyword[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  setKeywords: React.Dispatch<React.SetStateAction<Keyword[]>>;
  
  // Utilities
  calculateScore: (news: Partial<NewsItem>) => number;
  getNewsById: (id: string) => NewsItem | undefined;
}

const NewsroomContext = createContext<NewsroomContextType | null>(null);

export function NewsroomProvider({ children }: { children: ReactNode }) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsItems);
  const [drafts, setDrafts] = useState<PostDraft[]>(mockDrafts);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [entities, setEntities] = useState<Entity[]>(mockEntities);
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);

  // Calculate score based on keywords and topics
  const calculateScore = (news: Partial<NewsItem>): number => {
    let score = 50; // Base score
    
    const content = `${news.title || ''} ${news.summary || ''}`.toLowerCase();
    
    // Keyword scoring
    keywords.forEach(keyword => {
      if (content.includes(keyword.term.toLowerCase())) {
        score += keyword.weight;
      }
    });
    
    // Topic priority scoring
    (news.topics || []).forEach(topicName => {
      const topic = topics.find(t => t.name === topicName);
      if (topic) {
        score += (5 - topic.priority) * 5; // Higher priority = more points
      }
    });
    
    // Source reliability scoring
    const source = sources.find(s => s.name === news.source);
    if (source && source.reliability > 85) {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // News functions
  const addNewsItem = (news: Omit<NewsItem, 'id' | 'capturedAt' | 'score'>) => {
    const score = calculateScore(news);
    const newNews: NewsItem = {
      ...news,
      id: crypto.randomUUID(),
      capturedAt: new Date(),
      score,
    };
    setNewsItems(prev => [newNews, ...prev]);
  };

  const updateNewsItem = (id: string, updates: Partial<NewsItem>) => {
    setNewsItems(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNewsItem = (id: string) => {
    setNewsItems(prev => prev.filter(n => n.id !== id));
  };

  const markNewsAsReady = (id: string) => {
    setNewsItems(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'ready' as const } : n
    ));
  };

  const getReadyNews = () => newsItems.filter(n => n.status === 'ready');

  const getNewsById = (id: string) => newsItems.find(n => n.id === id);

  // Draft functions
  const addDraft = (draft: Omit<PostDraft, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newDraft: PostDraft = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setDrafts(prev => [...prev, newDraft]);
  };

  const updateDraft = (id: string, updates: Partial<PostDraft>) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
    ));
  };

  const updateDraftStatus = (id: string, status: PostStatus) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, status, updatedAt: new Date() } : d
    ));
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    // Also remove from calendar if scheduled
    setCalendarEvents(prev => prev.filter(e => e.postId !== id));
  };

  const scheduleDraft = (id: string, scheduledAt: Date) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;

    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, scheduledAt, updatedAt: new Date() } : d
    ));

    // Update or create calendar event
    const existingEvent = calendarEvents.find(e => e.postId === id);
    const news = newsItems.find(n => n.id === draft.newsItemId);
    
    if (existingEvent) {
      setCalendarEvents(prev => prev.map(e => 
        e.postId === id ? { ...e, scheduledAt } : e
      ));
    } else {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        postId: id,
        platform: draft.platform,
        scheduledAt,
        title: news?.title.substring(0, 50) || 'Post',
        status: draft.status,
      };
      setCalendarEvents(prev => [...prev, newEvent]);
    }
  };

  const generateDraftsForNews = (newsId: string) => {
    const news = newsItems.find(n => n.id === newsId);
    if (!news) return;

    const platforms: Platform[] = ['linkedin', 'twitter', 'instagram', 'facebook'];
    const now = new Date();

    const templates: Record<Platform, (n: NewsItem, v: number) => string> = {
      linkedin: (n, v) => v === 1 
        ? `📊 ${n.title}\n\n${n.summary}\n\nPuntos clave:\n${n.keyPoints.map(p => `• ${p}`).join('\n')}\n\n${n.editorialAngle}\n\n#${n.topics.join(' #')}`
        : `🔍 Análisis: ${n.title}\n\n${n.editorialAngle}\n\nLo que esto significa para los líderes empresariales:\n\n${n.keyPoints[0]}\n\n¿Qué opinas?\n\n#Liderazgo #${n.topics[0]}`,
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

    // Create 2 variants for each platform
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
            variant,
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

  const getDraftsForNews = (newsId: string) => drafts.filter(d => d.newsItemId === newsId);

  // Calendar functions
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <NewsroomContext.Provider value={{
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
      setTopics,
      setEntities,
      setSources,
      setKeywords,
      calculateScore,
      getNewsById,
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
