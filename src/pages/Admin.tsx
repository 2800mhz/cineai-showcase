import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield, FileText, AlertTriangle, Users, BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockTitles } from "@/data/mockData";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/");
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const pendingTitles = mockTitles.filter((t) => t.status === "pending");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">Content moderation and site management</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <Badge>{mockTitles.length}</Badge>
          </div>
          <p className="text-2xl font-bold">{mockTitles.length}</p>
          <p className="text-sm text-muted-foreground">Total Titles</p>
        </div>

        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <Badge variant="destructive">{pendingTitles.length}</Badge>
          </div>
          <p className="text-2xl font-bold">{pendingTitles.length}</p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </div>

        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-muted-foreground" />
            <Badge>2</Badge>
          </div>
          <p className="text-2xl font-bold">2</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>

        <div className="glass rounded-xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <BarChart className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Reports</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="content">Content Review</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-muted-foreground">
              Welcome to the admin panel. Use the tabs above to manage content, review reports, and
              manage users.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Pending Content</h2>
            {pendingTitles.length === 0 ? (
              <p className="text-muted-foreground">No pending content to review</p>
            ) : (
              <div className="space-y-3">
                {pendingTitles.map((title) => (
                  <div key={title.id} className="p-4 rounded-lg bg-surface flex items-center gap-4">
                    <img
                      src={title.posterUrl}
                      alt={title.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{title.title}</h3>
                      <p className="text-sm text-muted-foreground">{title.year}</p>
                      <Badge variant="outline" className="mt-2">{title.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Reported Content</h2>
            <p className="text-muted-foreground">No reports to review</p>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <p className="text-muted-foreground">User management tools coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
