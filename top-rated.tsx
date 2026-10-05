import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchTopRated } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";

export const Route = createFileRoute("/top-rated")({
  loader: async () => fetchTopRated(),
  head: () => ({
    meta: [
      { title: "Top Rated — ANCY" },
      { name: "description", content: "The highest-rated movies and series on ANCY." },
      { property: "og:title", content: "Top Rated — ANCY" },
      { property: "og:description", content: "The best movies and series by rating." },
    ],
  }),
  component: TopRatedPage,
});

function TopRatedPage() {
  const items = Route.useLoaderData();
  const [language, setLanguage] = useState("en");
  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const title = language === "ar" ? "الأعلى تقييماً" : language === "fr" ? "Mieux notés" : "Top Rated";
  return (
    <div className="px-4 pt-24 sm:px-8">
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">{title}</h1>
      <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
