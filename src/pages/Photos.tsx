import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPhotos, mockTitles } from "@/data/mockData";

export default function Photos() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhotos = mockPhotos.filter((photo) => {
    const title = mockTitles.find((t) => t.id === photo.titleId);
    return title?.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Photo Gallery</h1>
        <p className="text-muted-foreground">Explore stills from AI-generated content</p>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="posters">Posters</TabsTrigger>
            <TabsTrigger value="stills">Stills</TabsTrigger>
            <TabsTrigger value="bts">Behind the Scenes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredPhotos.length} {filteredPhotos.length === 1 ? "photo" : "photos"} found
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => {
          const title = mockTitles.find((t) => t.id === photo.titleId);
          return (
            <div
              key={photo.id}
              className="group relative aspect-video rounded-xl overflow-hidden hover-lift cursor-pointer"
            >
              <img
                src={photo.imageUrl}
                alt={title?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="font-semibold">{title?.title}</p>
                  <p className="text-sm text-muted-foreground">{photo.type}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No photos found</p>
        </div>
      )}
    </div>
  );
}
