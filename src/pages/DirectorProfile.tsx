import { useParams, Link } from "react-router-dom";
import { UserPlus, Star, Eye, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TitleCard } from "@/components/common/TitleCard";
import { mockDirectors, mockTitles } from "@/data/mockData";
import { toast } from "sonner";

export default function DirectorProfile() {
  const { id } = useParams();
  const director = mockDirectors.find((d) => d.id === id);

  if (!director) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Director not found</h1>
        <Link to="/creators" className="text-primary hover:underline mt-4 inline-block">
          Browse Creators
        </Link>
      </div>
    );
  }

  const directorTitles = mockTitles.filter((t) => director.movieIds.includes(t.id));

  const handleFollow = () => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to follow creators");
      return;
    }
    toast.success(`Following ${director.name}`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <img
              src={director.avatarUrl}
              alt={director.name}
              className="w-48 h-48 rounded-full object-cover shadow-large mx-auto md:mx-0"
            />

            {/* Info */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold">{director.name}</h1>
                <Badge variant="outline" className="text-base">Director</Badge>
                <p className="text-lg text-muted-foreground">{director.shortBio}</p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{director.totalTitles}</p>
                    <p className="text-muted-foreground">Titles</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{director.avgRating.toFixed(1)}</p>
                    <p className="text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {(director.totalViews / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-muted-foreground">Total Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {(director.followerCount / 1000).toFixed(0)}K
                    </p>
                    <p className="text-muted-foreground">Followers</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Button className="gap-2" onClick={handleFollow}>
                <UserPlus className="h-4 w-4" />
                Follow
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Biography */}
        <section className="glass rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Biography</h2>
          <p className="text-muted-foreground leading-relaxed">{director.bio}</p>

          {director.achievements.length > 0 && (
            <div className="space-y-2 pt-4">
              <h3 className="font-semibold">Notable Achievements</h3>
              <ul className="space-y-2">
                {director.achievements.map((achievement, index) => (
                  <li key={index} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Filmography */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Filmography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {directorTitles.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
