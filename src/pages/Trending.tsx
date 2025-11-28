import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleCard } from "@/components/common/TitleCard";
import { TitleCardSkeleton } from "@/components/common/TitleCardSkeleton";
import { useTitles } from "@/hooks/useTitles";

export default function Trending() {
  const { titles, loading } = useTitles();

  const trendingTitles = useMemo(
    () =>
      titles
        .filter((t) => t.trendingScore)
        .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)),
    [titles]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Trending Now</h1>
        </div>
        <p className="text-muted-foreground">Most popular AI-generated content right now</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="week" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <TitleCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {trendingTitles.slice(0, 12).map((title, index) => (
                <div key={title.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-gold">
                    {index + 1}
                  </div>
                  <TitleCard title={title} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {trendingTitles.map((title, index) => (
              <div key={title.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-gold">
                  {index + 1}
                </div>
                <TitleCard title={title} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="month" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {trendingTitles.map((title, index) => (
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
