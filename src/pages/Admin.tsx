import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Film, AlertTriangle, Star } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTitles: 0,
    totalRatings: 0
  });

  useEffect(() => {
    if (! authLoading) {
      if (! user) {
        navigate("/signin");
        return;
      }
      checkAdminAccess();
    }
  }, [user, authLoading]);

  const checkAdminAccess = async () => {
    try {
      // Veritabanından admin rolünü kontrol et
      const { data, error } = await supabase. rpc('is_admin');

      if (error) {
        console. error("RPC error:", error);
        // Fallback: user_roles tablosundan kontrol et
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?. id)
          .single();
        
        if (roleData?. role !== 'admin') {
          toast.error("Access denied");
          navigate("/");
          return;
        }
      } else if (! data) {
        toast.error("Access denied.  Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchStats();
    } catch (err) {
      console.error("Admin check failed:", err);
      navigate("/");
    }
  };

  const fetchStats = async () => {
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: titleCount } = await supabase
      .from("titles")
      .select("*", { count: "exact", head: true });

    const { count: ratingCount } = await supabase
      .from("ratings")
      .select("*", { count: "exact", head: true });

    setStats({
      totalUsers: userCount || 0,
      totalTitles: titleCount || 0,
      totalRatings: ratingCount || 0
    });

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page. </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 text-center">
          <Users className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-muted-foreground">Total Users</p>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <Film className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-3xl font-bold">{stats.totalTitles}</p>
          <p className="text-muted-foreground">Total Titles</p>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <Star className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-3xl font-bold">{stats.totalRatings}</p>
          <p className="text-muted-foreground">Total Ratings</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="glass rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <p className="text-muted-foreground">User management coming soon...</p>
        </TabsContent>

        <TabsContent value="content" className="glass rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Content Management</h2>
          <p className="text-muted-foreground">Content management coming soon...</p>
        </TabsContent>

        <TabsContent value="reports" className="glass rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Reports</h2>
          <p className="text-muted-foreground">No reports to review</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}