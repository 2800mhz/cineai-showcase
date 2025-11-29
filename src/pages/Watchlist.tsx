import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TitleCard } from "@/components/common/TitleCard";
import { TitleCardSkeleton } from "@/components/common/TitleCardSkeleton";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [watchlistTitles, setWatchlistTitles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }

    if (user) {
      fetchWatchlist();
    }
  }, [user, authLoading, navigate]);

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
      setLoading(false);
      return;
    }

    setWatchlistTitles(data?.map(item => item.titles) || []);
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">My Watchlist</h1>
        <p className="text-muted-foreground">
          {watchlistTitles.length} {watchlistTitles.length === 1 ? "title" : "titles"} in your
          watchlist
        </p>
      </div>

      {/* Grid */}
      {watchlistTitles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {watchlistTitles.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <Film className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Your watchlist is empty</h2>
          <p className="text-muted-foreground">Start adding movies and series to your watchlist</p>
          <Button>Browse Movies</Button>
        </div>
      )}
    </div>
  );
}
