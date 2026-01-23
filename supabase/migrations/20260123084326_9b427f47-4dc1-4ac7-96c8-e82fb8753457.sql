-- Add unique constraints for upsert operations
ALTER TABLE public.topics ADD CONSTRAINT topics_user_name_unique UNIQUE (user_id, name);
ALTER TABLE public.entities ADD CONSTRAINT entities_user_name_unique UNIQUE (user_id, name);
ALTER TABLE public.sources ADD CONSTRAINT sources_user_name_unique UNIQUE (user_id, name);
ALTER TABLE public.keywords ADD CONSTRAINT keywords_user_term_unique UNIQUE (user_id, term);