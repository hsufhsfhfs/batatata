import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSeries } from "@/lib/tmdb.functions";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";

export const Route = createFileRoute("/series")({
  loader: async () => fetchSeries(),
  head: () => ({
    meta: [
      { title: "Series — ANCY" },
      {
        name: "description",
        content: "Browse series: trending, popular, top rated and currently airing.",
      },
      { property: "og:title", content: "Series — ANCY" },
      { property: "og:description", content: "Browse newest series on ANCY." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const copy = language === "ar"
    ? { empty: "لا توجد مسلسلات متاحة حالياً. تحقق من اتصال TMDB وحاول مرة أخرى.", retry: "حاول مرة أخرى" }
    : language === "fr"
      ? { empty: "Aucune série disponible pour le moment. Vérifiez TMDB et réessayez.", retry: "Réessayer" }
      : { empty: "No series are available right now. Check TMDB and try again.", retry: "Try again" };
  return (
    <div>
      <Hero items={data.hero} />
      <h1 className="sr-only">Series</h1>
      {data.unavailable || !data.rows?.some((row) => row.items.length) ? (
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="mx-auto mb-4 h-16 w-full max-w-xs animate-pulse rounded-lg bg-surface-strong" />
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
          <button type="button" onClick={() => router.invalidate()} className="mt-5 rounded-md border border-border bg-surface-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            {copy.retry}
          </button>
        </div>
      ) : (
        data.rows.map((row) => (
          <MediaRow key={row.title} title={row.title} items={row.items} />
        ))
      )}
    </div>
  );
}
