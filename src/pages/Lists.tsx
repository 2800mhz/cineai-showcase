import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, List, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UserList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  item_count?: number;
}

export default function Lists() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (! authLoading && user) {
      fetchLists();
    } else if (! authLoading && ! user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchLists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      . from("user_lists")
      .select(`
        id,
        name,
        description,
        is_public,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load lists");
    } else {
      // Get item counts for each list
      const listsWithCounts = await Promise. all(
        (data || []).map(async (list) => {
          const { count } = await supabase
            .from("list_items")
            .select("*", { count: "exact", head: true })
            .eq("list_id", list.id);
          return { ...list, item_count: count || 0 };
        })
      );
      setLists(listsWithCounts);
    }
    setLoading(false);
  };

  const handleCreateList = async () => {
    if (!user) {
      toast.error("Please sign in to create lists");
      return;
    }

    if (! newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    const { data, error } = await supabase
      .from("user_lists")
      .insert({
        user_id: user. id,
        name: newListName. trim(),
        description: newListDescription. trim() || null,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create list");
    } else {
      toast.success("List created successfully!");
      setLists([{ ...data, item_count: 0 }, ...lists]);
      setDialogOpen(false);
      setNewListName("");
      setNewListDescription("");
      setIsPublic(false);
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (! confirm(`Are you sure you want to delete "${listName}"?`)) return;

    const { error } = await supabase
      .from("user_lists")
      .delete()
      .eq("id", listId);

    if (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    } else {
      toast. success("List deleted");
      setLists(lists. filter((l) => l.id !== listId));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading lists...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <List className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-bold">Sign in to view your lists</h1>
          <p className="text-muted-foreground">Create custom collections of your favorite titles</p>
          <Button onClick={() => navigate("/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">My Lists</h1>
          <p className="text-muted-foreground">Organize your favorite titles into collections</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="listName">List Name</Label>
                <Input
                  id="listName"
                  placeholder="My Favorite Movies"
                  value={newListName}
                  onChange={(e) => setNewListName(e. target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listDescription">Description (optional)</Label>
                <Textarea
                  id="listDescription"
                  placeholder="A collection of..."
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPublic">Make this list public</Label>
              </div>
              <Button onClick={handleCreateList} className="w-full">
                Create List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lists Grid */}
      {lists.length > 0 ?  (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <div
              key={list. id}
              className="glass rounded-xl p-6 space-y-4 hover:bg-surface-elevated transition-colors cursor-pointer"
              onClick={() => navigate(`/lists/${list. id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{list.name}</h3>
                  {list.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {list.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info("Edit coming soon!");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e. stopPropagation();
                      handleDeleteList(list. id, list.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{list.item_count} titles</span>
                <span>•</span>
                <span>{list.is_public ? "Public" : "Private"}</span>
                <span>•</span>
                <span>{new Date(list.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <List className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-semibold">No lists yet</h2>
          <p className="text-muted-foreground">Create your first list to organize your favorite content</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First List
          </Button>
        </div>
      )}
    </div>
  );
}