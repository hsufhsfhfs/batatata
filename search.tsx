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

const SEARCH_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
];

function SearchPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initial = params.get("query") || "";
  const initialType = params.get("type");
  const maxYear = new Date().getFullYear();
  const requestedYear = Number(params.get("year"));
  const initialYear = requestedYear
    ? String(Math.max(1900, Math.min(requestedYear, maxYear)))
    : "";
  const requestedGenre = params.get("genre") || "";
  const initialGenre = SEARCH_GENRES.find((item) => String(item.id) === requestedGenre || item.name === requestedGenre);
  const yearOptions = Array.from({ length: maxYear - 1899 }, (_, index) => String(maxYear - index));
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [kind, setKind] = useState<"all" | "movie" | "tv">(initialType === "movie" || initialType === "tv" ? initialType : "all");
  const [year, setYear] = useState(initialYear);
  const [genre, setGenre] = useState(initialGenre ? String(initialGenre.id) : "");
  const [language, setLanguage] = useState("en");
  const runSearch = useServerFn(fetchSearch);

  useEffect(() => {
    setLanguage(window.localStorage.getItem("ancy:lang") || "en");
  }, []);

  const copy = language === "ar"
    ? { title: "بحث", placeholder: "ابحث عن فيلم أو مسلسل...", type: "النوع", all: "الكل", movies: "أفلام", series: "مسلسلات", year: "السنة", anyYear: "كل السنوات", genre: "النوع الفني", allGenres: "كل الأنواع", empty: "لا توجد نتائج مطابقة." }
    : language === "fr"
      ? { title: "Recherche", placeholder: "Rechercher un film ou une série...", type: "Type", all: "Tout", movies: "Films", series: "Séries", year: "Année", anyYear: "Toutes les années", genre: "Genre", allGenres: "Tous les genres", empty: "Aucun résultat correspondant." }
      : { title: "Search", placeholder: "Search for a movie or series...", type: "Type", all: "All", movies: "Movies", series: "Series", year: "Year", anyYear: "Any year", genre: "Genre", allGenres: "All genres", empty: "No matching results." };

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
      if (kind !== "all") url.searchParams.set("type", kind);
      else url.searchParams.delete("type");
      if (year) url.searchParams.set("year", year);
      else url.searchParams.delete("year");
      if (genre) url.searchParams.set("genre", genre);
      else url.searchParams.delete("genre");
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }, [query, kind, year, genre]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", query, kind, year, genre],
    queryFn: () => runSearch({ data: { query, kind, year: year ? Number(year) : undefined, genre: genre ? Number(genre) : undefined } }),
  });
  const selectedGenre = SEARCH_GENRES.find((item) => String(item.id) === genre);
  const results = (data || []).filter((item) => !selectedGenre || item.genres.includes(selectedGenre.name));
  const hasSearch = query.length > 1 || kind !== "all" || Boolean(year) || Boolean(genre);

  return (
    <div className="min-h-screen px-4 pt-24 sm:px-8">
      <h1 className="mb-5 text-2xl font-black sm:text-3xl">{copy.title}</h1>
      <div className="relative max-w-xl">
        <SearchIcon className="absolute inset-y-0 end-4 my-auto size-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={copy.placeholder}
          aria-label={copy.placeholder}
          className="w-full rounded-full border border-border bg-surface-strong py-3 pe-11 ps-5 text-sm outline-none focus:border-foreground/40"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {copy.type}
          <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="min-h-10 rounded border border-border bg-surface-strong px-3 text-sm text-foreground">
            <option value="all">{copy.all}</option>
            <option value="movie">{copy.movies}</option>
            <option value="tv">{copy.series}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {copy.year}
          <select value={year} onChange={(event) => setYear(event.target.value)} className="min-h-10 min-w-32 rounded border border-border bg-surface-strong px-3 text-sm text-foreground">
            <option value="">{copy.anyYear}</option>
            {yearOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {copy.genre}
          <select value={genre} onChange={(event) => setGenre(event.target.value)} className="min-h-10 rounded border border-border bg-surface-strong px-3 text-sm text-foreground">
            <option value="">{copy.allGenres}</option>
            {SEARCH_GENRES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 sm:justify-start">
        {results.map((item) => <MediaCard key={item.id} item={item} />)}
      </div>

      {hasSearch && !isFetching && data && results.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{copy.empty}</p>
      ) : null}
    </div>
  );
}
