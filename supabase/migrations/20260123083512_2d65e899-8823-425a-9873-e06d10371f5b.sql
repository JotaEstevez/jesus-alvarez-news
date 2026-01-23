-- =============================================
-- TABLAS PARA NEWSROOM DE JESÚS ÁLVAREZ
-- =============================================

-- 1. TOPICS (Temas)
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own topics" ON public.topics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own topics" ON public.topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON public.topics
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON public.topics
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ENTITIES (Entidades)
CREATE TABLE public.entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('person', 'company', 'organization')),
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entities" ON public.entities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entities" ON public.entities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entities" ON public.entities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entities" ON public.entities
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. SOURCES (Fuentes)
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  reliability INTEGER NOT NULL DEFAULT 80 CHECK (reliability >= 0 AND reliability <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sources" ON public.sources
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sources" ON public.sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sources" ON public.sources
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sources" ON public.sources
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. KEYWORDS (Palabras clave)
CREATE TABLE public.keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('impact', 'negative')),
  weight INTEGER NOT NULL DEFAULT 5 CHECK (weight >= -10 AND weight <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own keywords" ON public.keywords
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own keywords" ON public.keywords
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own keywords" ON public.keywords
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own keywords" ON public.keywords
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON public.keywords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. NEWS_ITEMS (Noticias)
CREATE TABLE public.news_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT,
  key_points TEXT[] DEFAULT '{}',
  verification_risks TEXT[] DEFAULT '{}',
  editorial_angle TEXT,
  topics TEXT[] DEFAULT '{}',
  entities TEXT[] DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'ready', 'generating', 'published', 'discarded')),
  published_at TIMESTAMP WITH TIME ZONE,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own news_items" ON public.news_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own news_items" ON public.news_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own news_items" ON public.news_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own news_items" ON public.news_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_news_items_updated_at
  BEFORE UPDATE ON public.news_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. POST_DRAFTS (Borradores de posts)
CREATE TABLE public.post_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  news_item_id UUID REFERENCES public.news_items(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'facebook')),
  content TEXT NOT NULL,
  variant INTEGER NOT NULL DEFAULT 1 CHECK (variant IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled', 'published')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own post_drafts" ON public.post_drafts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own post_drafts" ON public.post_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own post_drafts" ON public.post_drafts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own post_drafts" ON public.post_drafts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_post_drafts_updated_at
  BEFORE UPDATE ON public.post_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_news_items_status ON public.news_items(status);
CREATE INDEX idx_news_items_user_id ON public.news_items(user_id);
CREATE INDEX idx_post_drafts_news_item_id ON public.post_drafts(news_item_id);
CREATE INDEX idx_post_drafts_platform ON public.post_drafts(platform);
CREATE INDEX idx_post_drafts_status ON public.post_drafts(status);
CREATE INDEX idx_post_drafts_user_id ON public.post_drafts(user_id);