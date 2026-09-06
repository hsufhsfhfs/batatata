import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Plus, Check, Star } from "lucide-react";
import type { MediaItem } from "@/lib/media";
import { useFavorites } from "@/hooks/use-favorites";

export function Hero({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState("en");
  const { has, toggle } = useFavorites();

  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const copy = language === "ar"
    ? { play: "تشغيل", favorite: "إضافة إلى المفضلة", slide: "الشريحة" }
    : language === "fr"
      ? { play: "Regarder", favorite: "Ajouter aux favoris", slide: "Diapositive" }
      : { play: "Watch", favorite: "Add to favorites", slide: "Slide" };

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[Math.min(index, items.length - 1)];

  return (
    <section className="relative h-[78svh] min-h-[26rem] w-full overflow-hidden">
      {items.map((it, i) => (
        <img
          key={it.id}
          src={it.backdrop ?? it.poster ?? ""}
          alt={it.title}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-14 sm:px-8">
        <div className="max-w-2xl">
          {item.logo ? (
            <img src={item.logo} alt={item.title} className="mb-4 max-h-28 w-auto max-w-[70%]" />
          ) : (
            <h1 className="mb-4 text-3xl font-black sm:text-5xl">{item.title}</h1>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-gold">
              <Star className="size-3.5 fill-current" />
              {item.rating.toFixed(1)}
            </span>
            <span>{item.year}</span>
            {item.genres.slice(0, 3).map((g) => (
              <span key={g} className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                {g}
              </span>
            ))}
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
            {item.overview}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              to="/watch/$id"
              params={{ id: item.id }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Play className="size-4 fill-current" />
              {copy.play}
            </Link>
            <button
              onClick={() => toggle(item.id)}
              aria-label={copy.favorite}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur transition hover:bg-secondary"
            >
              {has(item.id) ? <Check className="size-5" /> : <Plus className="size-5" />}
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              aria-label={`${copy.slide} ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
