import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleCard } from "@/components/common/TitleCard";
import { TitleCardSkeleton } from "@/components/common/TitleCardSkeleton";
import { Calendar, Film } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  join_date: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }

    if (user) {
      fetchProfile();
      fetchWatchlist();
      fetchRatings();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      toast.error("Failed to load profile");
      console.error(error);
      return;
    }

    setProfile(data);
  };

  const fetchWatchlist = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("watchlist")
      .select(`
        title_id,
        titles (*)
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching watchlist:", error);
      return;
    }

    setWatchlist(data?.map(item => item.titles) || []);
  };

  const fetchRatings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("ratings")
      .select(`
        rating,
        created_at,
        title_id,
        titles (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ratings:", error);
      setLoading(false);
      return;
    }

    setRatings(data || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Profile not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
        <img
          src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
          alt={profile.username}
          className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
        />

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold">{profile.username}</h1>
            <p className="text-muted-foreground mt-2">{profile.email}</p>
            {profile.bio && <p className="mt-2">{profile.bio}</p>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(profile.join_date).toLocaleDateString()}</span>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xl font-bold">{watchlist.length}</p>
              <p className="text-muted-foreground">Watchlist</p>
            </div>
            <div>
              <p className="text-xl font-bold">{ratings.length}</p>
              <p className="text-muted-foreground">Ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="watchlist">
        <TabsList>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="mt-6">
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {watchlist.map((title) => (
                <TitleCard key={title.id} title={title} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <Film className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Your watchlist is empty</h2>
              <p className="text-muted-foreground">Start adding movies and series</p>
              <Button onClick={() => navigate("/movies")}>Browse Movies</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ratings" className="mt-6">
          {ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.title_id} className="glass rounded-xl p-4 flex gap-4">
                  <img
                    src={rating.titles.poster_url || "/placeholder.svg"}
                    alt={rating.titles.title}
                    className="w-20 h-30 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{rating.titles.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rated on {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold text-primary">{rating.rating}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <h2 className="text-2xl font-semibold">No ratings yet</h2>
              <p className="text-muted-foreground">Start rating films you've watched</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
