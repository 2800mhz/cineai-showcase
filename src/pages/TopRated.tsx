import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleCard } from "@/components/common/TitleCard";
import { mockTitles } from "@/data/mockData";

export default function TopRated() {
  const topRated = [...mockTitles].sort((a, b) => b.rating - a.rating);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Star className="h-10 w-10 text-primary fill-current" />
          <h1 className="text-4xl font-bold">Top Rated</h1>
        </div>
        <p className="text-muted-foreground">Highest rated AI-generated content</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {topRated.map((title, index) => (
              <div key={title.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-gold">
                  {index + 1}
                </div>
                <TitleCard title={title} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movies" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {topRated
              .filter((t) => t.type === "movie")
              .map((title, index) => (
                <div key={title.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-gold">
                    {index + 1}
                  </div>
                  <TitleCard title={title} />
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="series" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {topRated
              .filter((t) => t.type === "series")
              .map((title, index) => (
                <div key={title.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-gold">
                    {index + 1}
                  </div>
                  <TitleCard title={title} />
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
