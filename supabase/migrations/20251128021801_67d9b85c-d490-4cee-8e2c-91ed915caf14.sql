-- Add AI analysis columns to titles table
ALTER TABLE public.titles 
ADD COLUMN IF NOT EXISTS aicinedb_film_id integer,
ADD COLUMN IF NOT EXISTS style_fingerprint text,
ADD COLUMN IF NOT EXISTS shot_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS character_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scene_count integer DEFAULT 0;

-- Add index for aicinedb_film_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_titles_aicinedb_film_id ON public.titles(aicinedb_film_id);

-- Add comment for documentation
COMMENT ON COLUMN public.titles.aicinedb_film_id IS 'Reference ID from AIcineDB backend analysis system';
COMMENT ON COLUMN public.titles.style_fingerprint IS 'AI-generated style analysis fingerprint';
COMMENT ON COLUMN public.titles.shot_count IS 'Number of detected shots in the film';
COMMENT ON COLUMN public.titles.character_count IS 'Number of detected characters in the film';
COMMENT ON COLUMN public.titles.scene_count IS 'Number of detected scenes in the film';

-- Enable realtime for titles table so we can subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.titles;