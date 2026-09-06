import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search as SearchIcon } from "lucide-react";
import { fetchSearch } from "@/lib/tmdb.functions";
import { MediaCard } from "@/components/MediaCard";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — ANCY" },
      { name: "description", content: "Search movies and series by name on ANCY." },
      { property: "og:title", content: "بحث — ANCY" },
      { property: "og:description", content: "Search movies and series by name." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initial = params.get("query") || "";
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [language, setLanguage] = useState("en");
  const runSearch = useServerFn(fetchSearch);

  useEffect(() => {
    setLanguage(window.localStorage.getItem("ancy:lang") || "en");
  }, []);

  const copy = language === "ar"
    ? { title: "بحث", placeholder: "ابحث عن فيلم أو مسلسل...", empty: "لا توجد نتائج مطابقة." }
    : language === "fr"
      ? { title: "Recherche", placeholder: "Rechercher un film ou une série...", empty: "Aucun résultat correspondant." }
      : { title: "Search", placeholder: "Search for a movie or series...", empty: "No matching results." };

  useEffect(() => {
    document.title = `${copy.title} — ANCY`;
  }, [copy.title]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(value.trim()), 400);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    // reflect the active query in the URL so taste-search can link here
    try {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set("query", query);
      else url.searchParams.delete("query");
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => runSearch({ data: { query } }),
    enabled: query.length > 1,
  });

  return (
    <div className="min-h-screen px-4 pt-24 sm:px-8">
      <h1 className="mb-5 text-2xl font-black sm:text-3xl">{copy.title}</h1>
      <div className="relative max-w-xl">
        <SearchIcon className="absolute inset-y-0 end-4 my-auto size-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={copy.placeholder}
          className="w-full rounded-full border border-border bg-surface-strong py-3 pe-11 ps-5 text-sm outline-none focus:border-foreground/40"
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 sm:justify-start">
        {data?.map((item) => <MediaCard key={item.id} item={item} />)}
      </div>

      {query.length > 1 && !isFetching && data && data.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{copy.empty}</p>
      ) : null}
    </div>
  );
}
