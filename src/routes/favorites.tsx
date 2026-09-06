import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { fetchByIds } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";
import { useFavorites } from "@/hooks/use-favorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
        { title: "Favorites — ANCY" },
      { name: "description", content: "Movies and series you have saved to your favorites." },
      { property: "og:title", content: "Favorites — ANCY" },
      { property: "og:description", content: "Your saved movies and series." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const [language, setLanguage] = useState("en");
  const { ids } = useFavorites();
  const load = useServerFn(fetchByIds);
  const { data } = useQuery({
    queryKey: ["favorites", ids],
    queryFn: () => load({ data: { ids } }),
    enabled: ids.length > 0,
  });
  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const copy = language === "ar"
    ? { title: "المفضلة", empty: "لم تُضف أي عنوان بعد. استخدم زر «+» على أي فيلم أو مسلسل." }
    : language === "fr"
      ? { title: "Favoris", empty: "Aucun titre pour le moment. Utilisez le bouton « + » sur un film ou une série." }
      : { title: "Favorites", empty: "Nothing here yet. Use the + button on any movie or series." };

  return (
    <div className="min-h-screen px-4 pt-24 sm:px-8">
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">{copy.title}</h1>
      {ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {copy.empty}
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
          {data?.map((item) => (item ? <MediaCard key={item.id} item={item} /> : null))}
        </div>
      )}
    </div>
  );
}
