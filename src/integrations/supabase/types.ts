export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      list_items: {
        Row: {
          created_at: string
          id: string
          list_id: string
          position: number | null
          title_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          list_id: string
          position?: number | null
          title_id: string
        }
        Update: {
          created_at?: string
          id?: string
          list_id?: string
          position?: number | null
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_photo_url: string | null
          created_at: string
          email: string
          id: string
          join_date: string
          last_seen: string | null
          preferences: Json | null
          role: string
          stats: Json | null
          status: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email: string
          id: string
          join_date?: string
          last_seen?: string | null
          preferences?: Json | null
          role?: string
          stats?: Json | null
          status?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email?: string
          id?: string
          join_date?: string
          last_seen?: string | null
          preferences?: Json | null
          role?: string
          stats?: Json | null
          status?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          title_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          title_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          title_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          id: string
          report_count: number | null
          review_text: string | null
          review_title: string | null
          title_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          report_count?: number | null
          review_text?: string | null
          review_title?: string | null
          title_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          report_count?: number | null
          review_text?: string | null
          review_title?: string | null
          title_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          ai_generation_date: string | null
          ai_model: string | null
          ai_parameters: Json | null
          ai_prompt: string | null
          backdrop_url: string | null
          created_at: string
          description: string | null
          dominant_color: string | null
          duration: number | null
          genres: string[] | null
          id: string
          logline: string | null
          moderator_notes: string | null
          moods: string[] | null
          poster_url: string | null
          production_company: string | null
          rating_average: number | null
          rating_count: number | null
          rejection_reason: string | null
          release_date: string | null
          search_vector: unknown
          seasons: number | null
          slug: string | null
          status: string
          tags: string[] | null
          title: string
          total_episodes: number | null
          trailer_youtube_url: string | null
          trending_score: number | null
          type: string
          updated_at: string
          uploaded_by: string | null
          view_count: number | null
          view_count_week: number | null
          year: number | null
        }
        Insert: {
          ai_generation_date?: string | null
          ai_model?: string | null
          ai_parameters?: Json | null
          ai_prompt?: string | null
          backdrop_url?: string | null
          created_at?: string
          description?: string | null
          dominant_color?: string | null
          duration?: number | null
          genres?: string[] | null
          id?: string
          logline?: string | null
          moderator_notes?: string | null
          moods?: string[] | null
          poster_url?: string | null
          production_company?: string | null
          rating_average?: number | null
          rating_count?: number | null
          rejection_reason?: string | null
          release_date?: string | null
          search_vector?: unknown
          seasons?: number | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title: string
          total_episodes?: number | null
          trailer_youtube_url?: string | null
          trending_score?: number | null
          type: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
          view_count_week?: number | null
          year?: number | null
        }
        Update: {
          ai_generation_date?: string | null
          ai_model?: string | null
          ai_parameters?: Json | null
          ai_prompt?: string | null
          backdrop_url?: string | null
          created_at?: string
          description?: string | null
          dominant_color?: string | null
          duration?: number | null
          genres?: string[] | null
          id?: string
          logline?: string | null
          moderator_notes?: string | null
          moods?: string[] | null
          poster_url?: string | null
          production_company?: string | null
          rating_average?: number | null
          rating_count?: number | null
          rejection_reason?: string | null
          release_date?: string | null
          search_vector?: unknown
          seasons?: number | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          total_episodes?: number | null
          trailer_youtube_url?: string | null
          trending_score?: number | null
          type?: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
          view_count_week?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "titles_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          following_type: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          following_type: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          following_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_progress: {
        Row: {
          created_at: string
          id: string
          last_watched: string
          percentage: number | null
          timestamp_seconds: number | null
          title_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_watched?: string
          percentage?: number | null
          timestamp_seconds?: number | null
          title_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_watched?: string
          percentage?: number | null
          timestamp_seconds?: number | null
          title_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          title_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
