import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { MediaItem } from "@/lib/media";
import { MediaCard } from "./MediaCard";

export function MediaRow({
  title,
  items,
  moreTo,
}: {
  title: string;
  items: MediaItem[];
  moreTo?: string;
}) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(window.localStorage.getItem("ancy:lang") || "en");
  }, []);

  const moreLabel = language === "ar" ? "عرض الكل" : language === "fr" ? "Voir tout" : "View all";

  if (!items.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-4 px-4 sm:px-8">
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        {moreTo ? (
          <Link to={moreTo} className="text-sm text-muted-foreground hover:text-foreground">
            {moreLabel}
          </Link>
        ) : null}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:px-8">
        {items.map((item) => (
          <MediaCard key={item.id + item.kind} item={item} />
        ))}
      </div>
    </section>
  );
}
