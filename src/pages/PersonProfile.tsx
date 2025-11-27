import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPeople, mockTitles } from "@/data/mockData";
import { toast } from "sonner";

export default function PersonProfile() {
  const { id } = useParams();
  const person = mockPeople.find((p) => p.id === id);

  if (!person) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Person not found</h1>
        <Link to="/creators" className="text-primary hover:underline mt-4 inline-block">
          Browse Creators
        </Link>
      </div>
    );
  }

  const handleFollow = () => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to follow");
      return;
    }
    toast.success(`Following ${person.name}`);
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-16 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <img
            src={person.avatarUrl}
            alt={person.name}
            className="w-48 h-48 rounded-full object-cover shadow-large mx-auto md:mx-0"
          />

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{person.name}</h1>
              <Badge className="capitalize">{person.primaryRole}</Badge>
            </div>

            <p className="text-muted-foreground">{person.bio}</p>

            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold">{person.totalCredits}</p>
                <p className="text-muted-foreground">Credits</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(person.followerCount / 1000).toFixed(0)}K
                </p>
                <p className="text-muted-foreground">Followers</p>
              </div>
            </div>

            <Button onClick={handleFollow}>Follow</Button>
          </div>
        </div>

        {/* Credits */}
        <section className="glass rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Credits</h2>
          <div className="space-y-3">
            {person.credits.map((credit, index) => {
              const title = mockTitles.find((t) => t.id === credit.titleId);
              return (
                <Link
                  key={index}
                  to={`/title/${credit.titleId}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface transition-colors"
                >
                  {title && (
                    <>
                      <img
                        src={title.posterUrl}
                        alt={title.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{title.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {credit.role}
                          {credit.characterName && ` as ${credit.characterName}`}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{title.year}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
