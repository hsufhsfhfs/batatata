import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchDetail } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";

export const Route = createFileRoute("/movie/$id")({
  head: () => ({
    meta: [{ title: "Movie details — ANCY" }, { name: "description", content: "Movie details and watch options." }],
  }),
  component: MovieDetail,
});

function useIdFromPath() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(window.location.pathname.split("/").pop() || null);
  }, []);
  return id;
}

function MovieDetail() {
  const id = useIdFromPath();
  const [language, setLanguage] = useState("en");
  const run = useServerFn(fetchDetail);

  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const copy = language === "ar"
    ? { description: "الوصف", cast: "طاقم التمثيل", seasons: "المواسم", recommendations: "التوصيات", noData: "لا توجد بيانات متاحة." }
    : language === "fr"
      ? { description: "Description", cast: "Distribution", seasons: "Saisons", recommendations: "Recommandations", noData: "Aucune donnée disponible." }
      : { description: "Description", cast: "Cast", seasons: "Seasons", recommendations: "Recommendations", noData: "No data available." };

  const { data, isFetching } = useQuery({
    queryKey: ["detail", id],
    queryFn: () => run({ data: { id: id || "" } }),
    enabled: Boolean(id),
  });

  if (!id) return <div className="px-4 pt-24">Loading…</div>;

  return (
    <div className="min-h-screen px-4 pt-24">
      {isFetching && <p>Loading…</p>}
      {data ? (
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          {data.logo ? <img src={data.logo} alt="logo" className="mt-4 max-h-24" /> : null}
          <Link
            to="/watch/$id"
            params={{ id: data.id }}
            className="mt-5 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Watch now
          </Link>

          <section className="mt-6">
            <h2 className="font-semibold">{copy.description}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{data.overview}</p>
          </section>

          <section className="mt-6">
            <h3 className="font-semibold">{copy.cast}</h3>
            <div className="mt-2 flex flex-wrap gap-3">
              {data.cast?.map((c) => (
                <div key={c.id} className="w-28 text-center">
                  <img src={c.photo || "/placeholder.png"} alt={c.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                  <div className="text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.character}</div>
                </div>
              ))}
            </div>
          </section>

          {data.seasons && data.seasons.length > 0 ? (
            <section className="mt-6">
                <h3 className="font-semibold">{copy.seasons}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.seasons.map((s) => (
                  <div key={s.number} className="rounded-md border px-3 py-2 text-sm">
                    {s.name} — {s.episodes} episodes
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6">
            <h3 className="font-semibold">{copy.recommendations}</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {data.similar?.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.noData}</p>
      )}
    </div>
  );
}
