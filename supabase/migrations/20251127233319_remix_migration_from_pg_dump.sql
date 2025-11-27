CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: generate_slug_from_title(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_slug_from_title() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;


--
-- Name: update_title_rating_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_title_rating_stats() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    UPDATE titles
    SET 
        rating_average = (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE title_id = NEW.title_id),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE title_id = NEW.title_id)
    WHERE id = NEW.title_id;
    RETURN NEW;
END;
$$;


--
-- Name: update_title_search_vector(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_title_search_vector() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.logline, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.genres, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.list_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    list_id uuid NOT NULL,
    title_id uuid NOT NULL,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    cover_photo_url text,
    bio text,
    role text DEFAULT 'user'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    join_date timestamp with time zone DEFAULT now() NOT NULL,
    last_seen timestamp with time zone,
    preferences jsonb DEFAULT '{"theme": "dark", "quality": "auto", "autoplay": true, "language": "en", "notifications": true}'::jsonb,
    stats jsonb DEFAULT '{"total_ratings": 0, "total_reviews": 0, "total_uploads": 0, "total_watch_time": 0}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_bio_check CHECK ((length(bio) <= 500)),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'moderator'::text, 'admin'::text]))),
    CONSTRAINT profiles_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'banned'::text]))),
    CONSTRAINT username_format CHECK ((username ~* '^[a-z0-9_]+$'::text)),
    CONSTRAINT username_length CHECK ((length(username) >= 3))
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title_id uuid NOT NULL,
    rating numeric(3,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ratings_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title_id uuid NOT NULL,
    review_title text,
    review_text text,
    helpful_count integer DEFAULT 0,
    report_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_helpful_count_check CHECK ((helpful_count >= 0)),
    CONSTRAINT reviews_report_count_check CHECK ((report_count >= 0))
);


--
-- Name: titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    slug text,
    type text NOT NULL,
    year integer,
    duration integer,
    logline text,
    description text,
    poster_url text,
    backdrop_url text,
    trailer_youtube_url text,
    status text DEFAULT 'pending'::text NOT NULL,
    rating_average numeric(3,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    view_count_week integer DEFAULT 0,
    trending_score numeric(10,2) DEFAULT 0,
    genres text[] DEFAULT ARRAY[]::text[],
    moods text[] DEFAULT ARRAY[]::text[],
    tags text[] DEFAULT ARRAY[]::text[],
    production_company text,
    release_date date,
    ai_model text,
    ai_prompt text,
    ai_generation_date timestamp with time zone,
    ai_parameters jsonb,
    seasons integer,
    total_episodes integer,
    search_vector tsvector,
    dominant_color text,
    uploaded_by uuid,
    moderator_notes text,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT titles_duration_check CHECK ((duration > 0)),
    CONSTRAINT titles_logline_check CHECK ((length(logline) <= 200)),
    CONSTRAINT titles_rating_average_check CHECK (((rating_average >= (0)::numeric) AND (rating_average <= (10)::numeric))),
    CONSTRAINT titles_rating_count_check CHECK ((rating_count >= 0)),
    CONSTRAINT titles_seasons_check CHECK ((seasons > 0)),
    CONSTRAINT titles_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'rejected'::text]))),
    CONSTRAINT titles_title_check CHECK ((length(title) >= 1)),
    CONSTRAINT titles_total_episodes_check CHECK ((total_episodes > 0)),
    CONSTRAINT titles_type_check CHECK ((type = ANY (ARRAY['movie'::text, 'series'::text, 'short'::text]))),
    CONSTRAINT titles_view_count_check CHECK ((view_count >= 0)),
    CONSTRAINT titles_view_count_week_check CHECK ((view_count_week >= 0)),
    CONSTRAINT titles_year_check CHECK (((year >= 1900) AND (year <= 2100)))
);


--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_follows (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    following_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_follows_following_type_check CHECK ((following_type = ANY (ARRAY['user'::text, 'creator'::text])))
);


--
-- Name: user_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_lists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_lists_name_check CHECK ((length(name) >= 1))
);


--
-- Name: watch_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watch_progress (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title_id uuid NOT NULL,
    timestamp_seconds integer DEFAULT 0,
    percentage numeric(5,2) DEFAULT 0,
    last_watched timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT watch_progress_percentage_check CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric))),
    CONSTRAINT watch_progress_timestamp_seconds_check CHECK ((timestamp_seconds >= 0))
);


--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watchlist (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: list_items list_items_list_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_list_id_title_id_key UNIQUE (list_id, title_id);


--
-- Name: list_items list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_user_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_title_id_key UNIQUE (user_id, title_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_user_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_title_id_key UNIQUE (user_id, title_id);


--
-- Name: titles titles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_pkey PRIMARY KEY (id);


--
-- Name: titles titles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_slug_key UNIQUE (slug);


--
-- Name: user_follows user_follows_follower_id_following_id_following_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_following_id_following_type_key UNIQUE (follower_id, following_id, following_type);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (id);


--
-- Name: user_lists user_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lists
    ADD CONSTRAINT user_lists_pkey PRIMARY KEY (id);


--
-- Name: watch_progress watch_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_progress
    ADD CONSTRAINT watch_progress_pkey PRIMARY KEY (id);


--
-- Name: watch_progress watch_progress_user_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_progress
    ADD CONSTRAINT watch_progress_user_id_title_id_key UNIQUE (user_id, title_id);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_user_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_title_id_key UNIQUE (user_id, title_id);


--
-- Name: idx_list_items_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_items_list_id ON public.list_items USING btree (list_id);


--
-- Name: idx_list_items_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_items_title_id ON public.list_items USING btree (title_id);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- Name: idx_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);


--
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- Name: idx_ratings_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratings_rating ON public.ratings USING btree (rating DESC);


--
-- Name: idx_ratings_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratings_title_id ON public.ratings USING btree (title_id);


--
-- Name: idx_ratings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratings_user_id ON public.ratings USING btree (user_id);


--
-- Name: idx_reviews_helpful_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_helpful_count ON public.reviews USING btree (helpful_count DESC);


--
-- Name: idx_reviews_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_title_id ON public.reviews USING btree (title_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_titles_genres; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_genres ON public.titles USING gin (genres);


--
-- Name: idx_titles_moods; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_moods ON public.titles USING gin (moods);


--
-- Name: idx_titles_rating_average; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_rating_average ON public.titles USING btree (rating_average DESC);


--
-- Name: idx_titles_search_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_search_vector ON public.titles USING gin (search_vector);


--
-- Name: idx_titles_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_slug ON public.titles USING btree (slug);


--
-- Name: idx_titles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_status ON public.titles USING btree (status);


--
-- Name: idx_titles_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_tags ON public.titles USING gin (tags);


--
-- Name: idx_titles_trending_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_trending_score ON public.titles USING btree (trending_score DESC);


--
-- Name: idx_titles_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_type ON public.titles USING btree (type);


--
-- Name: idx_titles_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_uploaded_by ON public.titles USING btree (uploaded_by);


--
-- Name: idx_titles_view_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_view_count ON public.titles USING btree (view_count DESC);


--
-- Name: idx_titles_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_year ON public.titles USING btree (year);


--
-- Name: idx_user_follows_follower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_follows_follower ON public.user_follows USING btree (follower_id);


--
-- Name: idx_user_follows_following; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_follows_following ON public.user_follows USING btree (following_id);


--
-- Name: idx_user_lists_is_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lists_is_public ON public.user_lists USING btree (is_public);


--
-- Name: idx_user_lists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lists_user_id ON public.user_lists USING btree (user_id);


--
-- Name: idx_watch_progress_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watch_progress_title_id ON public.watch_progress USING btree (title_id);


--
-- Name: idx_watch_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watch_progress_user_id ON public.watch_progress USING btree (user_id);


--
-- Name: idx_watchlist_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watchlist_title_id ON public.watchlist USING btree (title_id);


--
-- Name: idx_watchlist_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watchlist_user_id ON public.watchlist USING btree (user_id);


--
-- Name: titles generate_title_slug; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER generate_title_slug BEFORE INSERT OR UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION public.generate_slug_from_title();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ratings update_ratings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ratings update_title_rating_on_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_title_rating_on_delete AFTER DELETE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_title_rating_stats();


--
-- Name: ratings update_title_rating_on_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_title_rating_on_insert AFTER INSERT ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_title_rating_stats();


--
-- Name: ratings update_title_rating_on_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_title_rating_on_update AFTER UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_title_rating_stats();


--
-- Name: titles update_titles_search_vector; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_titles_search_vector BEFORE INSERT OR UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION public.update_title_search_vector();


--
-- Name: titles update_titles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_titles_updated_at BEFORE UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_lists update_user_lists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON public.user_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: watch_progress update_watch_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_watch_progress_updated_at BEFORE UPDATE ON public.watch_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: list_items list_items_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.user_lists(id) ON DELETE CASCADE;


--
-- Name: list_items list_items_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_title_id_fkey FOREIGN KEY (title_id) REFERENCES public.titles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_title_id_fkey FOREIGN KEY (title_id) REFERENCES public.titles(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_title_id_fkey FOREIGN KEY (title_id) REFERENCES public.titles(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: titles titles_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: user_follows user_follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_lists user_lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lists
    ADD CONSTRAINT user_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: watch_progress watch_progress_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_progress
    ADD CONSTRAINT watch_progress_title_id_fkey FOREIGN KEY (title_id) REFERENCES public.titles(id) ON DELETE CASCADE;


--
-- Name: watch_progress watch_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_progress
    ADD CONSTRAINT watch_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: watchlist watchlist_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_title_id_fkey FOREIGN KEY (title_id) REFERENCES public.titles(id) ON DELETE CASCADE;


--
-- Name: watchlist watchlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: titles Anyone can view completed titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view completed titles" ON public.titles FOR SELECT USING ((status = 'completed'::text));


--
-- Name: list_items Anyone can view items in public lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view items in public lists" ON public.list_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_lists
  WHERE ((user_lists.id = list_items.list_id) AND (user_lists.is_public = true)))));


--
-- Name: user_lists Anyone can view public lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public lists" ON public.user_lists FOR SELECT USING ((is_public = true));


--
-- Name: watchlist Users can delete from own watchlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete from own watchlist" ON public.watchlist FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: list_items Users can delete items from own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete items from own lists" ON public.list_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_lists
  WHERE ((user_lists.id = list_items.list_id) AND (user_lists.user_id = auth.uid())))));


--
-- Name: user_follows Users can delete own follows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own follows" ON public.user_follows FOR DELETE USING ((auth.uid() = follower_id));


--
-- Name: user_lists Users can delete own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own lists" ON public.user_lists FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ratings Users can delete own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own ratings" ON public.ratings FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: reviews Users can delete own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: list_items Users can insert items to own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert items to own lists" ON public.list_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_lists
  WHERE ((user_lists.id = list_items.list_id) AND (user_lists.user_id = auth.uid())))));


--
-- Name: user_lists Users can insert own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own lists" ON public.user_lists FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ratings Users can insert own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reviews Users can insert own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: watch_progress Users can insert own watch progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own watch progress" ON public.watch_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: titles Users can insert titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert titles" ON public.titles FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND (uploaded_by = auth.uid())));


--
-- Name: watchlist Users can insert to own watchlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert to own watchlist" ON public.watchlist FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_follows Users can manage own follows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own follows" ON public.user_follows FOR INSERT WITH CHECK ((auth.uid() = follower_id));


--
-- Name: user_lists Users can update own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own lists" ON public.user_lists FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: ratings Users can update own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: reviews Users can update own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: titles Users can update own titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own titles" ON public.titles FOR UPDATE USING ((uploaded_by = auth.uid()));


--
-- Name: watch_progress Users can update own watch progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own watch progress" ON public.watch_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view active profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active profiles" ON public.profiles FOR SELECT USING ((status = 'active'::text));


--
-- Name: user_follows Users can view all follows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all follows" ON public.user_follows FOR SELECT USING (true);


--
-- Name: ratings Users can view all ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all ratings" ON public.ratings FOR SELECT USING (true);


--
-- Name: reviews Users can view all reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);


--
-- Name: list_items Users can view items in own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view items in own lists" ON public.list_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_lists
  WHERE ((user_lists.id = list_items.list_id) AND (user_lists.user_id = auth.uid())))));


--
-- Name: user_lists Users can view own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own lists" ON public.user_lists FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: titles Users can view own pending titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own pending titles" ON public.titles FOR SELECT USING ((uploaded_by = auth.uid()));


--
-- Name: watch_progress Users can view own watch progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own watch progress" ON public.watch_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: watchlist Users can view own watchlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: list_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: titles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_follows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

--
-- Name: user_lists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: watch_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: watchlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


