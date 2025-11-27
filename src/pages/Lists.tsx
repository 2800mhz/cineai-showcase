import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Lists() {
  const user = localStorage.getItem("currentUser");

  const handleCreateList = () => {
    if (!user) {
      toast.error("Please sign in to create lists");
      return;
    }
    toast.success("List creation coming soon!");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Sign in to view your lists</h1>
          <p className="text-muted-foreground">Create custom collections of your favorite titles</p>
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
        <Button className="gap-2" onClick={handleCreateList}>
          <Plus className="h-4 w-4" />
          Create List
        </Button>
      </div>

      {/* Empty State */}
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-semibold">No lists yet</h2>
        <p className="text-muted-foreground">Create your first list to organize your favorite content</p>
        <Button onClick={handleCreateList}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First List
        </Button>
      </div>
    </div>
  );
}
