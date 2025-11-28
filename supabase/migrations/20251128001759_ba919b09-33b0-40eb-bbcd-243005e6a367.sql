-- Move pg_trgm extension from public schema to extensions schema
-- This follows Supabase best practices for extension management

-- Drop the extension from public schema if it exists there
DROP EXTENSION IF EXISTS pg_trgm CASCADE;

-- Create the extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Grant usage on extensions schema to relevant roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Recreate the search vector trigger for titles table
-- since it uses tsvector functions that work with pg_trgm
DROP TRIGGER IF EXISTS update_titles_search_vector ON public.titles;

CREATE TRIGGER update_titles_search_vector
BEFORE INSERT OR UPDATE ON public.titles
FOR EACH ROW
EXECUTE FUNCTION public.update_title_search_vector();