import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const PLATFORMS = [
  { slug: "netflix", name: "Netflix", color: "#e50914" },
  { slug: "hbomax", name: "HBO Max", color: "#7f5af0" },
  { slug: "appletv", name: "Apple TV+", color: "#f5f5f7" },
  { slug: "primevideo", name: "Prime Video", color: "#00a8e1" },
  { slug: "hulu", name: "Hulu", color: "#1ce783" },
  { slug: "paramountplus", name: "Paramount+", color: "#0064ff" },
  { slug: "disney", name: "Disney+", color: "#0f4bd8" },
  { slug: "peacock", name: "Peacock", color: "#ffb800" },
];

export function Platforms() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(window.localStorage.getItem("ancy:lang") || "en");
  }, []);

  const heading = language === "ar" ? "المنصات" : language === "fr" ? "Plateformes" : "Platforms";

  return (
    <section className="mt-12">
      <h2 className="mb-3 px-4 text-lg font-bold sm:px-8 sm:text-xl">{heading}</h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:px-8">
        {PLATFORMS.map((p) => (
          <Link
            key={p.slug}
            to="/platform/$slug"
            params={{ slug: p.slug }}
            className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-strong text-sm font-bold tracking-wide transition hover:border-foreground/30 hover:bg-accent"
            style={{ color: p.color }}
          >
            {p.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
