import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchPlatform } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";

export const Route = createFileRoute("/platform/$slug")({
  loader: async ({ params }) => fetchPlatform({ data: { slug: params.slug } }),
  head: () => ({ meta: [{ title: "Platform — ANCY" }] }),
  component: PlatformPage,
});

function PlatformPage() {
  const data = Route.useLoaderData();
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(window.localStorage.getItem("ancy:lang") || "en");
  }, []);

  const copy = language === "ar"
    ? { items: "العناصر", empty: "لا توجد بيانات للمنصة." }
    : language === "fr"
      ? { items: "Contenu", empty: "Aucune donnée pour cette plateforme." }
      : { items: "Titles", empty: "No titles found for this platform." };
  const items = data ? [...(data.movies || []), ...(data.tv || [])] : [];

  return (
    <div className="min-h-screen px-4 pt-24">
      {data ? (
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>

          <section className="mt-6">
            <h3 className="font-semibold">{copy.items}</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {items.map((item: any) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
            {!items.length && <p className="mt-3 text-sm text-muted-foreground">{copy.empty}</p>}
          </section>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      )}
    </div>
  );
}
