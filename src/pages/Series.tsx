import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TitleCard } from "@/components/common/TitleCard";
import { mockTitles } from "@/data/mockData";

export default function Series() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");

  const series = mockTitles
    .filter((t) => t.type === "series")
    .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "views":
          return b.viewCount - a.viewCount;
        case "recent":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case "trending":
        default:
          return (b.trendingScore || 0) - (a.trendingScore || 0);
      }
    });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Series</h1>
        <p className="text-muted-foreground">Explore AI-generated series</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {series.length} {series.length === 1 ? "series" : "series"} found
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {series.map((show) => (
          <TitleCard key={show.id} title={show} />
        ))}
      </div>

      {/* Empty State */}
      {series.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No series found</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
