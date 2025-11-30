import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TitleCarousel } from "@/components/common/TitleCarousel";
import { TitleCardSkeleton } from "@/components/common/TitleCardSkeleton";
import { useTitles } from "@/hooks/useTitles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Home() {
  const { titles, loading, error } = useTitles();
  const { user } = useAuth();

  // Memoize filtered sections
  const trendingMovies = useMemo(
    () =>
      titles
        .filter((t) => t.type === "movie" && t.trendingScore)
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
        .slice(0, 10),
    [titles]
  );

  const trendingSeries = useMemo(
    () => titles.filter((t) => t.type === "series"). slice(0, 10),
    [titles]
  );

  const topRated = useMemo(
    () => [... titles].sort((a, b) => b.rating - a. rating). slice(0, 10),
    [titles]
  );

  const featuredTitle = titles[0];

  const handleWatchlist = async () => {
    if (!user) {
      toast.error("Please sign in to use watchlist");
      return;
    }

    if (! featuredTitle) return;

    const { error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        title_id: featuredTitle.id,
      });

    if (error) {
      if (error.code === "23505") {
        toast.info("Already in watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
      return;
    }

    toast.success("Added to watchlist");
  };

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}.  Displaying cached content. 
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading skeletons
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }). map((_, i) => (
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state
  if (titles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold">No Films Found</h2>
          <p className="text-muted-foreground">
            There are no films in the database yet. Check back later! 
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Up Next Kaldırıldı */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[95vh] overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage: `url(${featuredTitle?. posterUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 pt-24 pb-12 lg:pt-32 lg:pb-20">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Featured
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
              {featuredTitle?. title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span>{featuredTitle?.year}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{featuredTitle?.rating?. toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({((featuredTitle?.ratingCount || 0) / 1000).toFixed(0)}K)
                </span>
              </div>
              <span>•</span>
              {featuredTitle?.duration && <span>{featuredTitle. duration}m</span>}
            </div>

            <p className="text-lg text-muted-foreground max-w-xl line-clamp-3">
              {featuredTitle?.logline || featuredTitle?.description}
            </p>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {featuredTitle?. genres?. map((genre) => (
                <Badge key={genre} variant="outline" className="capitalize">
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">AI Model:</span>{" "}
                {featuredTitle?. aiModel}
              </p>
              <p>
                <span className="text-foreground font-medium">Production:</span>{" "}
                {featuredTitle?.productionCompany}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="gap-2 shadow-gold" asChild>
                <Link to={`/title/${featuredTitle?. id}`}>
                  <Play className="h-5 w-5" />
                  Play Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={handleWatchlist}>
                <Plus className="h-5 w-5" />
                Watchlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <TitleCarousel
            titles={trendingMovies}
            title="Trending Movies"
            viewAllLink="/movies"
          />
        )}

        {/* Trending Series */}
        {trendingSeries.length > 0 && (
          <TitleCarousel
            titles={trendingSeries}
            title="Trending Series"
            viewAllLink="/series"
          />
        )}

        {/* Top Rated */}
        {topRated.length > 0 && (
          <TitleCarousel
            titles={topRated}
            title="Top Rated of All Time"
            viewAllLink="/movies"
          />
        )}

        {/* Mood Section */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Explore by Mood</h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Dark",
              "Uplifting",
              "Mind-Bending",
              "Nostalgic",
              "Intense",
              "Whimsical",
              "Epic",
              "Intimate",
            ].map((mood) => (
              <Button
                key={mood}
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {mood}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}