import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, User, Bell, Shield, Palette } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  cover_photo_url: string | null;
  preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    public_profile?: boolean;
    show_watchlist?: boolean;
    show_ratings?: boolean;
    theme?: string;
    language?: string;
  } | null;
}

export default function ProfileSettings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Form states
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  
  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showWatchlist, setShowWatchlist] = useState(true);
  const [showRatings, setShowRatings] = useState(true);

  useEffect(() => {
    if (! authLoading && ! user) {
      navigate("/signin");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      . select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      toast.error("Failed to load profile");
      console.error(error);
      setLoading(false);
      return;
    }

    setProfile(data);
    setUsername(data.username || "");
    setBio(data.bio || "");
    setAvatarUrl(data.avatar_url || "");
    setCoverPhotoUrl(data.cover_photo_url || "");
    
    // Load preferences
    const prefs = data.preferences || {};
    setEmailNotifications(prefs.email_notifications ??  true);
    setPushNotifications(prefs.push_notifications ?? true);
    setPublicProfile(prefs.public_profile ?? true);
    setShowWatchlist(prefs. show_watchlist ??  true);
    setShowRatings(prefs.show_ratings ?? true);
    
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e. target.files?.[0];
    if (! file || ! user) return;

    // Validate file
    if (! file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar. ${fileExt}`;

    toast.loading("Uploading avatar...");

    const { error: uploadError } = await supabase. storage
      .from("avatars")
      . upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.dismiss();
      toast. error("Failed to upload avatar");
      console.error(uploadError);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      . getPublicUrl(fileName);

    setAvatarUrl(urlData.publicUrl);
    toast.dismiss();
    toast.success("Avatar uploaded!");
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e. target.files?.[0];
    if (!file || !user) return;

    if (!file.type. startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const fileExt = file.name. split(".").pop();
    const fileName = `${user.id}/cover.${fileExt}`;

    toast.loading("Uploading cover photo...");

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.dismiss();
      toast. error("Failed to upload cover photo");
      console.error(uploadError);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("covers")
      .getPublicUrl(fileName);

    setCoverPhotoUrl(urlData.publicUrl);
    toast.dismiss();
    toast. success("Cover photo uploaded!");
  };

  const handleSaveProfile = async () => {
    if (! user) return;

    setSaving(true);

    const preferences = {
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      public_profile: publicProfile,
      show_watchlist: showWatchlist,
      show_ratings: showRatings,
    };

    const { error } = await supabase
      . from("profiles")
      .update({
        username: username. trim(),
        bio: bio. trim() || null,
        avatar_url: avatarUrl || null,
        cover_photo_url: coverPhotoUrl || null,
        preferences,
        last_seen: new Date(). toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast. error("Failed to save profile");
      console.error(error);
      return;
    }

    toast.success("Profile saved successfully!");
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Profile not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <Button onClick={() => navigate("/profile")} variant="outline">
            Back to Profile
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Cover Photo */}
            <div className="glass rounded-xl overflow-hidden">
              <div 
                className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative"
                style={coverPhotoUrl ? { backgroundImage: `url(${coverPhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <label className="absolute bottom-4 right-4 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <Button variant="secondary" size="sm" className="gap-2" asChild>
                    <span>
                      <Camera className="h-4 w-4" />
                      Change Cover
                    </span>
                  </Button>
                </label>
              </div>

              {/* Avatar */}
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-16">
                  <div className="relative">
                    <img
                      src={avatarUrl || `https://api.dicebear.com/7. x/avataaars/svg?seed=${username}`}
                      alt={username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-background"
                    />
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" asChild>
                        <span>
                          <Camera className="h-4 w-4" />
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="flex-1 pb-2">
                    <h2 className="text-2xl font-bold">{username}</h2>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e. target.value)}
                  placeholder="Your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">{bio. length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-muted-foreground">Or upload an image above</p>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Theme & Display</h3>
              <p className="text-muted-foreground">Customize how AI CineDB looks for you</p>
              
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-background border"></div>
                  <span>System</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border"></div>
                  <span>Light</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2 border-primary">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border"></div>
                  <span>Dark</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Privacy Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Profile</p>
                  <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                </div>
                <Switch
                  checked={publicProfile}
                  onCheckedChange={setPublicProfile}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Watchlist</p>
                  <p className="text-sm text-muted-foreground">Display your watchlist on your profile</p>
                </div>
                <Switch
                  checked={showWatchlist}
                  onCheckedChange={setShowWatchlist}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Ratings</p>
                  <p className="text-sm text-muted-foreground">Display your ratings on your profile</p>
                </div>
                <Switch
                  checked={showRatings}
                  onCheckedChange={setShowRatings}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}