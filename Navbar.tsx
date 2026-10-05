import { Link } from "@tanstack/react-router";
import { Home, Film, Tv, Heart, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    movies: "Movies",
    series: "Series",
    favorites: "Favorites",
    search: "Search",
    settings: "Settings",
  },
  ar: {
    home: "الرئيسية",
    movies: "أفلام",
    series: "مسلسلات",
    favorites: "المفضلة",
    search: "بحث",
    settings: "الإعدادات",
  },
  fr: {
    home: "Accueil",
    movies: "Films",
    series: "Séries",
    favorites: "Favoris",
    search: "Recherche",
    settings: "Paramètres",
  },
};

export function Navbar() {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("ancy:lang") : null;
    if (stored) setLang(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ancy:lang", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const t = translations[lang] || translations.en;

  const items = [
    { to: "/", label: t.home, icon: Home },
    { to: "/movies", label: t.movies, icon: Film },
    { to: "/series", label: t.series, icon: Tv },
    { to: "/favorites", label: t.favorites, icon: Heart },
    { to: "/search", label: t.search, icon: Search },
    { to: "/settings", label: t.settings, icon: Settings },
  ] as const;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <nav aria-label="Primary navigation" className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center gap-1 overflow-x-auto rounded-full border border-border bg-background/80 p-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl scrollbar-none">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold sm:px-4"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            <Icon className="size-4" />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        ))}

        <div className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground sm:px-4">
          <label className="sr-only">Language</label>
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => {
              const nextLanguage = e.target.value;
              setLang(nextLanguage);
              window.localStorage.setItem("ancy:lang", nextLanguage);
              window.dispatchEvent(new Event("ancy:language"));
            }}
            className="rounded-md border border-border bg-surface-strong px-2 py-1 text-sm text-foreground focus:outline-none"
          >
            <option value="en">EN</option>
            <option value="ar">ع</option>
            <option value="fr">FR</option>
          </select>
        </div>
      </nav>
    </header>
  );
}
