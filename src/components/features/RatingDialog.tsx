import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  titleName: string;
  currentRating?: number;
  onRated?: () => void;
}

export const RatingDialog = ({
  open,
  onOpenChange,
  titleId,
  titleName,
  currentRating,
  onRated,
}: RatingDialogProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleRate = async () => {
    if (!user) {
      toast.error("Please sign in to rate");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsLoading(true);

    // Upsert rating
    const { error: ratingError } = await supabase
      .from("ratings")
      .upsert({
        user_id: user.id,
        title_id: titleId,
        rating: rating,
      }, {
        onConflict: 'user_id,title_id'
      });

    if (ratingError) {
      toast.error("Failed to save rating");
      console.error(ratingError);
      setIsLoading(false);
      return;
    }

    // Recalculate title rating
    const { data: allRatings, error: fetchError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("title_id", titleId);

    if (fetchError) {
      console.error("Failed to fetch ratings:", fetchError);
    } else if (allRatings) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      
      await supabase
        .from("titles")
        .update({
          rating_average: avgRating,
          rating_count: allRatings.length,
        })
        .eq("id", titleId);
    }

    toast.success("Rating saved!");
    onRated?.();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong">
        <DialogHeader>
          <DialogTitle>Rate {titleName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {(hoverRating || rating) > 0 ? `${hoverRating || rating}/10` : "Select rating"}
            </p>
          </div>

          <Button onClick={handleRate} className="w-full" disabled={isLoading || rating === 0}>
            {isLoading ? "Saving..." : currentRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
