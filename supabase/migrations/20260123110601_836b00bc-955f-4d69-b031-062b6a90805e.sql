-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own rss_sources" ON public.rss_sources;
DROP POLICY IF EXISTS "Users can create their own rss_sources" ON public.rss_sources;
DROP POLICY IF EXISTS "Users can update their own rss_sources" ON public.rss_sources;
DROP POLICY IF EXISTS "Users can delete their own rss_sources" ON public.rss_sources;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Users can view their own rss_sources"
ON public.rss_sources
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rss_sources"
ON public.rss_sources
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rss_sources"
ON public.rss_sources
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rss_sources"
ON public.rss_sources
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);