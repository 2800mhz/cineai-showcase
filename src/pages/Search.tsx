import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleCard } from "@/components/common/TitleCard";
import { mockTitles, mockDirectors, mockPeople } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Search() {
  const [query, setQuery] = useState("");

  const searchTitles = mockTitles.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  const searchDirectors = mockDirectors.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const searchPeople = mockPeople.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = searchTitles.length + searchDirectors.length + searchPeople.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground">Find titles, creators, and more</p>
      </div>

      {/* Search Input */}
      <div className="relative glass rounded-xl p-4">
        <SearchIcon className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for titles, directors, actors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 text-lg h-14"
          autoFocus
        />
      </div>

      {/* Results */}
      {query && (
        <>
          <div className="text-sm text-muted-foreground">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="titles">Titles ({searchTitles.length})</TabsTrigger>
              <TabsTrigger value="people">People ({searchDirectors.length + searchPeople.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {searchTitles.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">Titles</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchTitles.slice(0, 10).map((title) => (
                      <TitleCard key={title.id} title={title} />
                    ))}
                  </div>
                </section>
              )}

              {(searchDirectors.length > 0 || searchPeople.length > 0) && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold">People</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchDirectors.map((director) => (
                      <Link
                        key={director.id}
                        to={`/director/${director.id}`}
                        className="glass rounded-xl p-4 hover-lift flex items-center gap-4"
                      >
                        <img
                          src={director.avatarUrl}
                          alt={director.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{director.name}</p>
                          <Badge variant="outline" className="mt-1">Director</Badge>
                        </div>
                      </Link>
                    ))}
                    {searchPeople.map((person) => (
                      <Link
                        key={person.id}
                        to={`/person/${person.id}`}
                        className="glass rounded-xl p-4 hover-lift flex items-center gap-4"
                      >
                        <img
                          src={person.avatarUrl}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{person.name}</p>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {person.primaryRole}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="titles">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchTitles.map((title) => (
                  <TitleCard key={title.id} title={title} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="people">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...searchDirectors, ...searchPeople].map((person) => (
                  <Link
                    key={person.id}
                    to={`/${"name" in person && "shortBio" in person ? "director" : "person"}/${person.id}`}
                    className="glass rounded-xl p-4 hover-lift flex items-center gap-4"
                  >
                    <img
                      src={person.avatarUrl}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{person.name}</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {"role" in person ? person.role : person.primaryRole}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Empty State */}
      {!query && (
        <div className="text-center py-20">
          <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Start typing to search</p>
        </div>
      )}

      {query && totalResults === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
