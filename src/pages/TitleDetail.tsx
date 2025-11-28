import { useParams, Link } from "react-router-dom";
import { Play, Plus, Share2, Star, Eye, Calendar, Clock, Film, Users, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDirectors } from "@/data/mockData";
import { fetchTitleById } from "@/services/filmService";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Title } from "@/types";

export default function TitleDetail() {
  const { id } = useParams();
  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTitle = async () => {
      if (!id) return;
      setLoading(true);
      const data = await fetchTitleById(id);
      setTitle(data);
      setLoading(false);
    };

    loadTitle();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[300px,1fr] gap-8">
          <Skeleton className="w-full h-[450px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Title not found</h1>
        <Link to="/movies" className="text-primary hover:underline mt-4 inline-block">
          Browse Movies
        </Link>
      </div>
    );
  }

  const directors = mockDirectors.filter((d) => title.directorIds.includes(d.id));

  const handleAction = (action: string) => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to " + action);
      return;
    }
    toast.success(`${action} successful!`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh]">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${title.posterUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[300px,1fr] gap-8 items-start">
            {/* Poster */}
            <div className="w-full max-w-[300px] mx-auto lg:mx-0">
              <img
                src={title.posterUrl}
                alt={title.title}
                className="w-full rounded-2xl shadow-large"
              />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold">{title.title}</h1>
                <p className="text-xl text-primary italic">{title.logline}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-2xl font-bold">{title.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({(title.ratingCount / 1000).toFixed(0)}K ratings)
                  </span>
                </div>
                <span>•</span>
                <span>{title.year}</span>
                <span>•</span>
                <Badge variant="outline" className="capitalize">
                  {title.type}
                </Badge>
                {title.duration && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {title.duration}m
                    </div>
                  </>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {(title.viewCount / 1000000).toFixed(1)}M views
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {title.genres.map((genre) => (
                  <Badge key={genre} className="capitalize">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gap-2" onClick={() => handleAction("play")}>
                  <Play className="h-5 w-5" />
                  Play Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleAction("add to watchlist")}
                >
                  <Plus className="h-5 w-5" />
                  Watchlist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleAction("share")}
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>

              {/* Directors */}
              {directors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    {directors.length > 1 ? "Directors" : "Director"}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {directors.map((director) => (
                      <Link
                        key={director.id}
                        to={`/director/${director.id}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <img
                          src={director.avatarUrl}
                          alt={director.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{director.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Details */}
              <div className="glass rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  AI Generation
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Model:</span>{" "}
                    <span className="font-medium">{title.aiModel}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Production:</span>{" "}
                    <span className="font-medium">{title.productionCompany}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Released:</span>{" "}
                    {new Date(title.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* AI Analysis Stats */}
              {title.aicinedbFilmId && (
                <div className="glass rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-primary uppercase">
                      AI Analysis
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {title.shotCount > 0 && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                        <Film className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-xl font-bold">{title.shotCount}</span>
                        <span className="text-xs text-muted-foreground">Shots</span>
                      </div>
                    )}
                    {title.sceneCount > 0 && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                        <Layers className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-xl font-bold">{title.sceneCount}</span>
                        <span className="text-xs text-muted-foreground">Scenes</span>
                      </div>
                    )}
                    {title.characterCount > 0 && (
                      <div className="flex flex-col items-center p-3 rounded-lg bg-background/50">
                        <Users className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-xl font-bold">{title.characterCount}</span>
                        <span className="text-xs text-muted-foreground">Characters</span>
                      </div>
                    )}
                  </div>
                  {title.styleFingerprint && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                        Style Fingerprint
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {title.styleFingerprint.split(',').slice(0, 6).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            {title.aiPrompt && <TabsTrigger value="ai">AI Details</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">{title.description}</p>

              {title.moods.length > 0 && (
                <div className="space-y-2 pt-4">
                  <h3 className="font-semibold">Mood & Vibe</h3>
                  <div className="flex flex-wrap gap-2">
                    {title.moods.map((mood) => (
                      <Badge key={mood} variant="secondary" className="capitalize">
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {title.tags.length > 0 && (
                <div className="space-y-2 pt-4">
                  <h3 className="font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {title.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cast" className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Cast & Crew</h2>
            <p className="text-muted-foreground">Cast information coming soon...</p>
          </TabsContent>

          <TabsContent value="reviews" className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Reviews & Ratings</h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              <Button className="mt-4" onClick={() => handleAction("write review")}>
                Write a Review
              </Button>
            </div>
          </TabsContent>

          {title.aiPrompt && (
            <TabsContent value="ai" className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-semibold">AI Generation Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Model Used</h3>
                  <p className="text-muted-foreground">{title.aiModel}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Generation Prompt</h3>
                  <p className="text-muted-foreground italic">{title.aiPrompt}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Generation Date</h3>
                  <p className="text-muted-foreground">
                    {new Date(title.generationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
}
