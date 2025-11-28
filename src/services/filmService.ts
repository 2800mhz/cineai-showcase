import { supabase } from "@/integrations/supabase/client";
import { mockTitles } from "@/data/mockData";
import type { Title } from "@/types";

/**
 * Maps Supabase title data to our Title type
 */
const mapSupabaseToTitle = (data: any): Title => {
  return {
    id: data.id,
    title: data.title,
    year: data.year || new Date().getFullYear(),
    type: data.type as "movie" | "series" | "short",
    duration: data.duration,
    rating: data.rating_average || 0,
    ratingCount: data.rating_count || 0,
    viewCount: data.view_count || 0,
    genres: data.genres || [],
    moods: data.moods || [],
    description: data.description || "",
    logline: data.logline || "",
    posterUrl: data.poster_url || "/placeholder.svg",
    youtubeUrl: data.trailer_youtube_url,
    status: data.status as "pending" | "processing" | "completed",
    directorIds: [],
    producerIds: [],
    writerIds: [],
    castIds: [],
    productionCompany: data.production_company || "",
    aiModel: data.ai_model || "Unknown",
    aiPrompt: data.ai_prompt,
    generationDate: data.ai_generation_date || data.created_at,
    tags: data.tags || [],
    dominantColor: data.dominant_color,
    trendingScore: data.trending_score,
    releaseDate: data.release_date || data.created_at,
    photoIds: [],
    seasons: data.seasons,
    totalEpisodes: data.total_episodes,
    // AI Analysis fields
    aicinedbFilmId: data.aicinedb_film_id,
    styleFingerprint: data.style_fingerprint,
    shotCount: data.shot_count || 0,
    characterCount: data.character_count || 0,
    sceneCount: data.scene_count || 0,
  };
};

/**
 * Fetches all titles from Supabase, falls back to mock data on error
 */
export const fetchTitles = async (): Promise<Title[]> => {
  try {
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // If no data in Supabase, return mock data
    if (!data || data.length === 0) {
      console.log("No titles in database, using mock data");
      return mockTitles;
    }

    return data.map(mapSupabaseToTitle);
  } catch (error) {
    console.error("Error fetching titles from Supabase:", error);
    console.log("Falling back to mock data");
    return mockTitles;
  }
};

/**
 * Fetches a single title by ID from Supabase
 */
export const fetchTitleById = async (id: string): Promise<Title | null> => {
  try {
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      // Fallback to mock data
      const mockTitle = mockTitles.find(t => t.id === id);
      return mockTitle || null;
    }

    return mapSupabaseToTitle(data);
  } catch (error) {
    console.error("Error fetching title by ID:", error);
    // Fallback to mock data
    const mockTitle = mockTitles.find(t => t.id === id);
    return mockTitle || null;
  }
};

/**
 * Fetches trending titles sorted by trending score
 */
export const fetchTrendingTitles = async (limit = 10): Promise<Title[]> => {
  try {
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .eq("status", "completed")
      .not("trending_score", "is", null)
      .order("trending_score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return mockTitles
        .filter(t => t.trendingScore)
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
        .slice(0, limit);
    }

    return data.map(mapSupabaseToTitle);
  } catch (error) {
    console.error("Error fetching trending titles:", error);
    return mockTitles
      .filter(t => t.trendingScore)
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, limit);
  }
};

/**
 * Fetches top-rated titles sorted by rating
 */
export const fetchTopRatedTitles = async (limit = 10): Promise<Title[]> => {
  try {
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .eq("status", "completed")
      .order("rating_average", { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return mockTitles
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    }

    return data.map(mapSupabaseToTitle);
  } catch (error) {
    console.error("Error fetching top-rated titles:", error);
    return mockTitles
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
};

/**
 * Fetches titles by type (movie, series, short)
 */
export const fetchTitlesByType = async (
  type: "movie" | "series" | "short", 
  limit = 10
): Promise<Title[]> => {
  try {
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .eq("status", "completed")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return mockTitles
        .filter(t => t.type === type)
        .slice(0, limit);
    }

    return data.map(mapSupabaseToTitle);
  } catch (error) {
    console.error(`Error fetching ${type} titles:`, error);
    return mockTitles
      .filter(t => t.type === type)
      .slice(0, limit);
  }
};
