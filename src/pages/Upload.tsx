import { useState } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Upload() {
  const user = localStorage.getItem("currentUser");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to upload content");
      return;
    }

    setIsSubmitting(true);
    // Mock upload
    setTimeout(() => {
      toast.success("Title uploaded successfully!");
      setIsSubmitting(false);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <UploadIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-bold">Sign in to upload content</h1>
          <p className="text-muted-foreground">Share your AI-generated films with the community</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Upload New Title</h1>
          <p className="text-muted-foreground">Share your AI-generated content with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 glass rounded-xl p-6">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Enter title" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  required
                  min="2020"
                  max={new Date().getFullYear()}
                  defaultValue={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logline">Logline</Label>
              <Input id="logline" name="logline" placeholder="One-line description" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Full synopsis"
                rows={4}
              />
            </div>
          </section>

          {/* AI Generation Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">AI Generation Details</h2>

            <div className="space-y-2">
              <Label htmlFor="aiModel">AI Model Used *</Label>
              <Select name="aiModel" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sora">Sora v2.5</SelectItem>
                  <SelectItem value="runway">RunwayML Gen-3</SelectItem>
                  <SelectItem value="pika">Pika 1.5</SelectItem>
                  <SelectItem value="stable">Stable Video Diffusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Generation Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="Describe the prompt used to generate this content"
                rows={3}
              />
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Title"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
