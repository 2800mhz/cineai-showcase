import { Link } from "react-router-dom";
import { Star, Eye, Heart, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";
import type { Title } from "@/types";

interface TitleCardProps {
  title: Title;
  showQuickActions?: boolean;
  className?: string;
}

export const TitleCard = ({ title, showQuickActions = true, className = "" }: TitleCardProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to use watchlist");
      return;
    }

    setIsInWatchlist(!isInWatchlist);
    toast.success(isInWatchlist ? "Removed from watchlist" : "Added to watchlist");
  };

  return (
    <Link
      to={`/title/${title.id}`}
      className={`group/card relative block rounded-2xl overflow-hidden bg-card hover-lift ${className}`}

    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={title.posterUrl}
          alt={title.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {title.trendingScore && title.trendingScore > 80 && (
            <Badge className="bg-destructive/90 backdrop-blur-sm">
              Trending
            </Badge>
          )}
          
          {/* AI Analyzed Badge */}
          {title.aicinedbFilmId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-primary/90 backdrop-blur-sm gap-1 cursor-help">
                    <Sparkles className="h-3 w-3" />
                    AI Analyzed
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Analyzed by AIcineDB</p>
                  {title.shotCount > 0 && <p className="text-xs">{title.shotCount} shots detected</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Watchlist Heart */}
        <button
          onClick={handleWatchlistToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWatchlist ? "fill-destructive text-destructive" : "text-foreground"
            }`}
          />
        </button>

        {/* Hover Overlay with Quick Actions */}
        {showQuickActions && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  toast.success("Opening player...");
                }}
              >
                <Play className="h-4 w-4" />
                Play
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {title.title}
        </h3>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{title.year}</span>
          <Badge variant="outline" className="text-xs">
            {title.type}
          </Badge>
          {title.duration && <span>{title.duration}m</span>}
          {title.totalEpisodes && <span>{title.totalEpisodes} eps</span>}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-primary">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">{title.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{(title.viewCount / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {title.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
