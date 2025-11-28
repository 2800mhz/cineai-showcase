import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTitles } from "@/services/filmService";
import type { Title } from "@/types";

/**
 * Custom hook for fetching titles with real-time updates
 * Automatically subscribes to Supabase realtime changes
 */
export const useTitles = () => {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const loadTitles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTitles();
        setTitles(data);
      } catch (err) {
        console.error("Error loading titles:", err);
        setError("Failed to load films");
      } finally {
        setLoading(false);
      }
    };

    loadTitles();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("titles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "titles",
        },
        async (payload) => {
          console.log("Real-time update received:", payload);
          
          if (payload.eventType === "INSERT" && payload.new) {
            // Map and add new title if it's completed
            if (payload.new.status === "completed") {
              const newTitle: Title = {
                id: payload.new.id,
                title: payload.new.title,
                year: payload.new.year || new Date().getFullYear(),
                type: payload.new.type as "movie" | "series" | "short",
                duration: payload.new.duration,
                rating: payload.new.rating_average || 0,
                ratingCount: payload.new.rating_count || 0,
                viewCount: payload.new.view_count || 0,
                genres: payload.new.genres || [],
                moods: payload.new.moods || [],
                description: payload.new.description || "",
                logline: payload.new.logline || "",
                posterUrl: payload.new.poster_url || "/placeholder.svg",
                youtubeUrl: payload.new.trailer_youtube_url,
                status: payload.new.status,
                directorIds: [],
                producerIds: [],
                writerIds: [],
                castIds: [],
                productionCompany: payload.new.production_company || "",
                aiModel: payload.new.ai_model || "Unknown",
                aiPrompt: payload.new.ai_prompt,
                generationDate: payload.new.ai_generation_date || payload.new.created_at,
                tags: payload.new.tags || [],
                dominantColor: payload.new.dominant_color,
                trendingScore: payload.new.trending_score,
                releaseDate: payload.new.release_date || payload.new.created_at,
                photoIds: [],
                seasons: payload.new.seasons,
                totalEpisodes: payload.new.total_episodes,
                aicinedbFilmId: payload.new.aicinedb_film_id,
                styleFingerprint: payload.new.style_fingerprint,
                shotCount: payload.new.shot_count || 0,
                characterCount: payload.new.character_count || 0,
                sceneCount: payload.new.scene_count || 0,
              };
              
              setTitles((prev) => [newTitle, ...prev]);
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            // Update existing title
            setTitles((prev) =>
              prev.map((title) =>
                title.id === payload.new.id
                  ? {
                      ...title,
                      title: payload.new.title,
                      rating: payload.new.rating_average || title.rating,
                      ratingCount: payload.new.rating_count || title.ratingCount,
                      viewCount: payload.new.view_count || title.viewCount,
                      aicinedbFilmId: payload.new.aicinedb_film_id,
                      styleFingerprint: payload.new.style_fingerprint,
                      shotCount: payload.new.shot_count || 0,
                      characterCount: payload.new.character_count || 0,
                      sceneCount: payload.new.scene_count || 0,
                    }
                  : title
              )
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            // Remove deleted title
            setTitles((prev) => prev.filter((title) => title.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { titles, loading, error };
};
