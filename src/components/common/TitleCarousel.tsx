import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TitleCard } from "./TitleCard";
import type { Title } from "@/types";

interface TitleCarouselProps {
  titles: Title[];
  title: string;
  viewAllLink?: string;
}

export const TitleCarousel = ({ titles, title, viewAllLink }: TitleCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-sm text-primary hover:underline font-medium"
          >
            View All
          </a>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x scroll-smooth"
        >
          {titles.map((title) => (
            <div
              key={title.id}
              className="flex-none w-[180px] sm:w-[220px] snap-start"
            >
              <TitleCard title={title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
