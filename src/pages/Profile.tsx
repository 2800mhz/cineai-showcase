import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Film, Star, Share2, Check, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleCard } from "@/components/common/TitleCard";
import { TitleCardSkeleton } from "@/components/common/TitleCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  join_date: string;
  cover_photo_url: string | null;
  role: string | null;
}

export default function Profile() {
  const { username: usernameParam } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (authLoading) return;

    // Eğer username parametresi varsa, o kullanıcıyı çek
    if (usernameParam) {
      fetchUserByUsername(usernameParam);
    } 
    // Eğer /profile ise ve giriş yapılmışsa, kendi profilini çek
    else if (currentUser) {
      fetchOwnProfile();
    } 
    // Giriş yapılmamışsa sign in'e yönlendir
    else {
      navigate("/signin");
    }
  }, [usernameParam, currentUser, authLoading]);

  const fetchOwnProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (error || !profileData) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
      setLoading(false);
      return;
    }

    setProfile(profileData);
    
    // URL'i username ile güncelle
    window.history.replaceState(null, "", `/profile/${profileData.username}`);
    
    await fetchUserData(profileData.id);
  };

  const fetchUserByUsername = async (username: string) => {
    setLoading(true);

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      . single();

    if (error || !profileData) {
      console.error("User not found:", error);
      setLoading(false);
      return;
    }

    setProfile(profileData);
    await fetchUserData(profileData.id);
  };

  const fetchUserData = async (userId: string) => {
    // Watchlist çek
    const { data: watchlistData } = await supabase
      .from("watchlist")
      .select(`
        title_id,
        titles (*)
      `)
      . eq("user_id", userId);

    setWatchlist(watchlistData?. map(item => item.titles). filter(Boolean) || []);

    // Ratings çek
    const { data: ratingsData } = await supabase
      .from("ratings")
      . select(`
        rating,
        created_at,
        title_id,
        titles (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setRatings(ratingsData || []);
    setLoading(false);
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profile?. username}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleFollow = () => {
    if (! currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }
    toast.success(`Following ${profile?.username}`);
  };

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length). toFixed(1)
    : null;

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold">User not found</h1>
        <p className="text-muted-foreground">
          {usernameParam ? `The user "${usernameParam}" doesn't exist. ` : "Profile not found. "}
        </p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Cover Photo */}
      <div 
        className="h-64 md:h-80 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 relative"
        style={profile. cover_photo_url ? {
          backgroundImage: `url(${profile.cover_photo_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-24 mb-8">
          <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7. x/avataaars/svg?seed=${profile. username}`}
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl mx-auto md:mx-0 -mt-20 md:-mt-16"
            />

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h1 className="text-4xl font-bold">{profile.username}</h1>
                    {profile.role === 'admin' && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                        ADMIN
                      </span>
                    )}
                  </div>
                  {isOwnProfile && (
                    <p className="text-muted-foreground mt-1">{profile.email}</p>
                  )}
                  {profile.bio && <p className="mt-3 max-w-xl text-muted-foreground">{profile.bio}</p>}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {copied ? "Copied!" : "Share"}
                  </Button>
                  
                  {isOwnProfile ?  (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <Link to="/profile/settings">
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={handleFollow}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.join_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-8 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold">{watchlist.length}</p>
                  <p className="text-sm text-muted-foreground">Watchlist</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{ratings.length}</p>
                  <p className="text-sm text-muted-foreground">Ratings</p>
                </div>
                {averageRating && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <p className="text-2xl font-bold">{averageRating}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="watchlist" className="mb-8">
          <TabsList>
            <TabsTrigger value="watchlist">Watchlist ({watchlist.length})</TabsTrigger>
            <TabsTrigger value="ratings">Ratings ({ratings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="mt-6">
            {watchlist.length > 0 ?  (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {watchlist.map((title) => (
                  <TitleCard key={title.id} title={title} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <Film className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Watchlist is empty</h2>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Start adding movies and series!" : `${profile.username} hasn't added any titles yet`}
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link to="/movies">Browse Movies</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ratings" className="mt-6">
            {ratings.length > 0 ?  (
              <div className="grid gap-4 md:grid-cols-2">
                {ratings.map((rating) => (
                  <Link 
                    key={rating. title_id} 
                    to={`/title/${rating.title_id}`}
                    className="glass rounded-xl p-4 flex gap-4 hover:bg-surface-elevated transition-colors"
                  >
                    <img
                      src={rating.titles?.poster_url || "/placeholder. svg"}
                      alt={rating.titles?.title || "Title"}
                      className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{rating.titles?.title || "Unknown"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rating.titles?.year} • {rating. titles?.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rated on {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-5 w-5 fill-primary text-primary" />
                        <span className="text-xl font-bold text-primary">{rating. rating}</span>
                        <span className="text-muted-foreground">/10</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <Star className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">No ratings yet</h2>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Start rating films you've watched!" : `${profile.username} hasn't rated any titles yet`}
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link to="/movies">Browse Movies</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}