import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockDirectors, mockPeople } from "@/data/mockData";
import { toast } from "sonner";

export default function Creators() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDirectors = mockDirectors.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPeople = mockPeople.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = (name: string) => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to follow creators");
      return;
    }
    toast.success(`Following ${name}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Creators & Talent</h1>
        <p className="text-muted-foreground">Discover the minds behind AI-generated cinema</p>
      </div>

      {/* Search */}
      <div className="relative glass rounded-xl p-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="directors">Directors</TabsTrigger>
          <TabsTrigger value="actors">Actors</TabsTrigger>
          <TabsTrigger value="producers">Producers</TabsTrigger>
          <TabsTrigger value="writers">Writers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Directors */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Directors</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDirectors.map((director) => (
                <Link
                  key={director.id}
                  to={`/director/${director.id}`}
                  className="glass rounded-xl p-6 hover-lift space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={director.avatarUrl}
                      alt={director.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{director.name}</h3>
                      <Badge variant="outline" className="mt-1">Director</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {director.shortBio}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {director.totalTitles} titles
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFollow(director.name);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Other Talent */}
          {filteredPeople.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Cast & Crew</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeople.map((person) => (
                  <Link
                    key={person.id}
                    to={`/person/${person.id}`}
                    className="glass rounded-xl p-6 hover-lift space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{person.name}</h3>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {person.primaryRole}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {person.totalCredits} credits
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleFollow(person.name);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="directors">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDirectors.map((director) => (
              <Link
                key={director.id}
                to={`/director/${director.id}`}
                className="glass rounded-xl p-6 hover-lift"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={director.avatarUrl}
                    alt={director.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{director.name}</h3>
                    <p className="text-sm text-muted-foreground">{director.totalTitles} titles</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
