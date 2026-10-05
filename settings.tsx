import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PLAYER_SOURCES, writeFavorites } from "@/lib/media";
import { useFavorites } from "@/hooks/use-favorites";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — ANCY" }, { name: "description", content: "Player, subtitle, and favorites preferences." }] }),
  component: SettingsPage,
});

const PREF_KEY = "orxa:preferredPlayer";
const PREF_SUBS = "orxa:subtitleLang";

function SettingsPage() {
  const { ids } = useFavorites();
  const [language, setLanguage] = useState("en");
  const [preferred, setPreferred] = useState<string>(() => {
    try {
      return localStorage.getItem(PREF_KEY) || PLAYER_SOURCES[0].key;
    } catch {
      return PLAYER_SOURCES[0].key;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, preferred);
    } catch {}
  }, [preferred]);

  const [preferredSubs, setPreferredSubs] = useState<string>(() => {
    try {
      return localStorage.getItem(PREF_SUBS) || "auto";
    } catch {
      return "auto";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREF_SUBS, preferredSubs);
    } catch {}
  }, [preferredSubs]);

  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const copy = language === "ar"
    ? { title: "الإعدادات", player: "مصدر المشغل المفضل", favorites: "المفضلات", count: "العناصر المفضلة", clear: "مسح المفضلات", subtitles: "لغة الترجمات المفضلة" }
    : language === "fr"
      ? { title: "Paramètres", player: "Source de lecture préférée", favorites: "Favoris", count: "Titres favoris", clear: "Effacer les favoris", subtitles: "Langue de sous-titres préférée" }
      : { title: "Settings", player: "Preferred player source", favorites: "Favorites", count: "Favorite titles", clear: "Clear favorites", subtitles: "Preferred subtitle language" };

  return (
    <div className="min-h-screen px-4 pt-24">
      <h1 className="text-2xl font-bold">{copy.title}</h1>

      <section className="mt-6">
        <h2 className="font-semibold">{copy.player}</h2>
        <div className="mt-2 flex gap-4">
          {PLAYER_SOURCES.map((player) => (
            <label key={player.key} className="inline-flex items-center gap-2">
              <input type="radio" name="player" value={player.key} checked={preferred === player.key} onChange={() => setPreferred(player.key)} />
              <span>{player.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">{copy.favorites}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.count}: {ids.length}</p>
        <div className="mt-3">
          <button
            onClick={() => writeFavorites([])}
            className="rounded-md border px-4 py-2 text-sm"
          >
            {copy.clear}
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">{copy.subtitles}</h2>
        <div className="mt-2">
          <select value={preferredSubs} onChange={(e) => setPreferredSubs(e.target.value)} className="rounded border border-border bg-surface-strong px-3 py-1 text-foreground">
            <option value="auto">تلقائي</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </section>
    </div>
  );
}
