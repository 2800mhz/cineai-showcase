import { useState, useEffect, useMemo } from "react";
import { Play, Plus, Star, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TitleCarousel } from "@/components/common/TitleCarousel";
import { TitleCardSkeleton } from "@/components/common/TitleCardSkeleton";
import { useTitles } from "@/hooks/useTitles";
import { toast } from "sonner";
import heroImage from "@/assets/hero-quantum-echoes.jpg";

export default function Home() {
  const { titles, loading, error } = useTitles();
  const [featuredIndex, setFeaturedIndex] = useState(0);

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
    () => titles.filter((t) => t.type === "series").slice(0, 10),
    [titles]
  );

  const topRated = useMemo(
    () => titles.sort((a, b) => b.rating - a.rating).slice(0, 10),
    [titles]
  );

  const upNext = useMemo(() => titles.slice(0, 4), [titles]);

  const featuredTitle = upNext[featuredIndex] || titles[0];

  const handleWatchlist = () => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to use watchlist");
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
            {error}. Displaying cached content.
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
          {Array.from({ length: 10 }).map((_, i) => (
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
      {/* Hero Section with Up Next Rail */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[95vh] overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage: `url(${featuredTitle.posterUrl})`,
              transform: `translateY(${0}px)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 pt-24 pb-12 lg:pt-32 lg:pb-20">
          <div className="grid lg:grid-cols-[1fr,350px] gap-8 items-center">
            {/* Main Hero Content */}
            <div className="space-y-6 max-w-2xl">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Featured
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
                {featuredTitle.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span>{featuredTitle.year}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{featuredTitle.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({(featuredTitle.ratingCount / 1000).toFixed(0)}K)
                  </span>
                </div>
                <span>•</span>
                {featuredTitle.duration && <span>{featuredTitle.duration}m</span>}
              </div>

              <p className="text-lg text-muted-foreground max-w-xl line-clamp-3">
                {featuredTitle.logline}
              </p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {featuredTitle.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="capitalize">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">AI Model:</span>{" "}
                  {featuredTitle.aiModel}
                </p>
                <p>
                  <span className="text-foreground font-medium">Production:</span>{" "}
                  {featuredTitle.productionCompany}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="gap-2 shadow-gold">
                  <Play className="h-5 w-5" />
                  Play Now
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={handleWatchlist}>
                  <Plus className="h-5 w-5" />
                  Watchlist
                </Button>
              </div>
            </div>

            {/* Up Next Rail */}
            <div className="space-y-4">
              <div className="space-y-4">
                {upNext.map((title, index) => (
                  <button
                    key={title.id}
                    onClick={() => setFeaturedIndex(index)}
                    className={`w-full flex gap-3 p-3 rounded-xl transition-all hover-lift ${
                      featuredIndex === index
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "glass hover:bg-surface-elevated"
                    }`}
                  >
                    <img
                      src={title.posterUrl}
                      alt={title.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 text-left space-y-1">
                      <h4 className="font-semibold text-sm line-clamp-2">{title.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{title.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{title.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Trending Movies */}
        <TitleCarousel
          titles={trendingMovies}
          title="Trending Movies"
          viewAllLink="/trending"
        />

        {/* Trending Series */}
        <TitleCarousel
          titles={trendingSeries}
          title="Trending Series"
          viewAllLink="/series"
        />

        {/* Top Rated */}
        <TitleCarousel
          titles={topRated}
          title="Top Rated of All Time"
          viewAllLink="/top-rated"
        />

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
