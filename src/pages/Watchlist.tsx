import { TitleCard } from "@/components/common/TitleCard";
import { Button } from "@/components/ui/button";
import { mockTitles } from "@/data/mockData";
import { Film } from "lucide-react";

export default function Watchlist() {
  const user = localStorage.getItem("currentUser");

  // Mock watchlist - in real app, get from user data
  const watchlistTitles = mockTitles.slice(0, 6);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <Film className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-bold">Sign in to view your watchlist</h1>
          <p className="text-muted-foreground">Keep track of titles you want to watch</p>
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
