import { useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUsers } from "@/data/mockData";
import { toast } from "sonner";

export default function UserProfile() {
  const { username } = useParams();
  const user = mockUsers.find((u) => u.username === username);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">User not found</h1>
      </div>
    );
  }

  const currentUser = localStorage.getItem("currentUser");
  const isOwnProfile = currentUser && JSON.parse(currentUser).username === username;

  const handleFollow = () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }
    toast.success(`Following ${user.username}`);
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-16 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start glass rounded-xl p-6">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
          />

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{user.username}</h1>
              {user.bio && <p className="text-muted-foreground">{user.bio}</p>}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-xl font-bold">{user.followers.length}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-xl font-bold">{user.following.length}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-xl font-bold">{user.ratings.length}</p>
                <p className="text-muted-foreground">Ratings</p>
              </div>
            </div>

            {!isOwnProfile && (
              <Button onClick={handleFollow}>Follow</Button>
            )}
            {isOwnProfile && (
              <Button variant="outline">Edit Profile</Button>
            )}
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-muted-foreground">No recent activity</p>
          </TabsContent>

          <TabsContent value="watchlist" className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>
            <p className="text-muted-foreground">
              {user.watchlist.length} titles in watchlist
            </p>
          </TabsContent>

          <TabsContent value="ratings" className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Ratings</h2>
            <div className="space-y-3">
              {user.ratings.map((rating) => (
                <div key={rating.titleId} className="p-3 rounded-lg bg-surface">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Title #{rating.titleId}</p>
                      {rating.review && <p className="text-sm text-muted-foreground mt-1">{rating.review}</p>}
                    </div>
                    <span className="text-primary font-bold">{rating.rating}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Lists</h2>
            <div className="space-y-3">
              {user.lists.map((list) => (
                <div key={list.id} className="p-4 rounded-lg bg-surface">
                  <h3 className="font-semibold">{list.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {list.titleIds.length} titles
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
