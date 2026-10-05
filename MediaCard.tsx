import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { MediaItem } from "@/lib/media";

export function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link
      to="/movie/$id"
      params={{ id: item.id }}
      className="group block w-[42vw] shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gold sm:w-44 md:w-48"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-surface-strong ring-1 ring-border transition-transform duration-300 group-hover:scale-[1.03]">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
            {item.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent p-2 pt-8 text-xs">
          <span className="flex items-center gap-1 text-gold">
            <Star className="size-3 fill-current" />
            {item.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">{item.year}</span>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-foreground/90">{item.title}</p>
    </Link>
  );
}
