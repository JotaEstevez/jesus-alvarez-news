-- Create RSS sources table
CREATE TABLE public.rss_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rss_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own rss_sources"
ON public.rss_sources
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rss_sources"
ON public.rss_sources
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rss_sources"
ON public.rss_sources
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rss_sources"
ON public.rss_sources
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_rss_sources_updated_at
BEFORE UPDATE ON public.rss_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint for url per user to avoid duplicate sources
ALTER TABLE public.rss_sources ADD CONSTRAINT rss_sources_user_url_unique UNIQUE (user_id, url);