import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { decodeId, embedUrl, PLAYER_SOURCES } from "@/lib/media";
import { fetchDetail } from "@/lib/tmdb.functions";

export const Route = createFileRoute("/watch/$id")({
  head: () => ({ meta: [{ title: "Watch — ANCY" }] }),
  component: WatchPage,
});

function WatchPage() {
  const { id } = Route.useParams();
  const decoded = useMemo(() => (id ? decodeId(id) : null), [id]);
  const runDetail = useServerFn(fetchDetail);
  const { data: detail } = useQuery({
    queryKey: ["watch-detail", id],
    queryFn: () => runDetail({ data: { id: id || "" } }),
    enabled: Boolean(id),
  });
  const [season, setSeason] = useState<number | undefined>(undefined);
  const [episode, setEpisode] = useState<number | undefined>(undefined);
  const [source, setSource] = useState(() => {
    try {
      const preferred = localStorage.getItem("orxa:preferredPlayer");
      return PLAYER_SOURCES.find((player) => player.key === preferred)?.key || PLAYER_SOURCES[0].key;
    } catch {
      return PLAYER_SOURCES[0].key;
    }
  });
  const [subtitleLang, setSubtitleLang] = useState(() => {
    try {
      return localStorage.getItem("ancy:subtitleLang") || "auto";
    } catch {
      return "auto";
    }
  });
  const [translateSubs, setTranslateSubs] = useState(() => {
    try {
      return localStorage.getItem("ancy:translateSubs") === "1";
    } catch {
      return false;
    }
  });
  const [language, setLanguage] = useState("en");
  const copy = language === "ar"
    ? { invalid: "معرّف غير صالح.", title: "مشاهدة", source: "المصدر", season: "الموسم", episode: "الحلقة", subtitles: "لغة الترجمة", translate: "ترجمة تلقائية", failed: "قد لا يعمل المشغّل الخارجي مع كل العناوين.", open: "فتح المشغّل في نافذة جديدة", sourceHint: "إذا لم يبدأ التشغيل، جرّب مصدراً آخر.", nextSource: "المصدر التالي", official: "خيارات المشاهدة الرسمية", note: "لأفضل تجربة، استخدم خدمات المشاهدة الرسمية أدناه." }
    : language === "fr"
      ? { invalid: "Identifiant invalide.", title: "Regarder", source: "Source", season: "Saison", episode: "Épisode", subtitles: "Langue des sous-titres", translate: "Traduction automatique", failed: "Le lecteur externe peut ne pas fonctionner pour tous les titres.", open: "Ouvrir le lecteur", sourceHint: "Si la lecture ne démarre pas, essayez une autre source.", nextSource: "Source suivante", official: "Options officielles", note: "Pour une meilleure expérience, utilisez les services officiels ci-dessous." }
      : { invalid: "Invalid ID.", title: "Watch", source: "Source", season: "Season", episode: "Episode", subtitles: "Subtitle language", translate: "Auto-translate subtitles", failed: "This third-party player may not work for every title.", open: "Open player", sourceHint: "If playback does not start, try another source.", nextSource: "Try next source", official: "Official watch options", note: "For the most reliable experience, use the official services below." };

  const seasons = detail?.seasons || [];
  const selectedSeason = seasons.find((item) => item.number === season) || seasons[0];
  const episodeCount = selectedSeason?.episodes || 0;

  useEffect(() => {
    if (decoded?.kind !== "tv" || !seasons.length) return;
    setSeason((current) => current && seasons.some((item) => item.number === current) ? current : seasons[0].number);
  }, [decoded?.kind, seasons]);

  useEffect(() => {
    if (decoded?.kind !== "tv" || !episodeCount) return;
    setEpisode((current) => current && current <= episodeCount ? current : 1);
  }, [decoded?.kind, episodeCount]);

  useEffect(() => {
    setLanguage(window.localStorage.getItem("ancy:lang") || "en");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("orxa:preferredPlayer", source);
    } catch {}
  }, [source]);

  useEffect(() => {
    localStorage.setItem("ancy:subtitleLang", subtitleLang);
    localStorage.setItem("ancy:translateSubs", translateSubs ? "1" : "0");
  }, [subtitleLang, translateSubs]);

  const src = useMemo(() => decoded
    ? embedUrl(source, decoded.kind, decoded.tmdbId, season, episode, subtitleLang === "auto" ? null : subtitleLang, translateSubs)
    : "", [decoded, source, season, episode, subtitleLang, translateSubs]);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [showSourceFallback, setShowSourceFallback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const copyFullscreen = language === "ar"
    ? { enter: "ملء الشاشة", exit: "إنهاء ملء الشاشة" }
    : language === "fr"
      ? { enter: "Plein écran", exit: "Quitter le plein écran" }
      : { enter: "Enter fullscreen", exit: "Exit fullscreen" };

  useEffect(() => {
    setIframeFailed(false);
    setShowSourceFallback(false);
    const timer = window.setTimeout(() => setShowSourceFallback(true), 12000);
    return () => window.clearTimeout(timer);
  }, [src]);

  const tryNextSource = () => {
    const currentIndex = PLAYER_SOURCES.findIndex((player) => player.key === source);
    setSource(PLAYER_SOURCES[(currentIndex + 1) % PLAYER_SOURCES.length].key);
  };

  useEffect(() => {
    const syncFullscreen = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => setIsFullscreen(false));
      } else {
        setIsFullscreen(false);
      }
      return;
    }

    try {
      if (!playerRef.current?.requestFullscreen) throw new Error("Fullscreen API unavailable");
      await playerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(true);
    }
  };

  if (!id || !decoded) return <div className="px-4 pt-24">{copy.invalid}</div>;

  return (
    <div className="min-h-screen px-4 pt-24">
      <h1 className="text-xl font-bold">{copy.title}</h1>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm sm:max-w-xs">
          {copy.source}
          <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className="min-h-10 rounded border border-border bg-surface-strong px-3 py-2 text-foreground">
            {PLAYER_SOURCES.map((player) => <option key={player.key} value={player.key}>{player.label}</option>)}
          </select>
        </label>

        {decoded.kind === "tv" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              {copy.season}
              <select
                value={selectedSeason?.number ?? ""}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className="min-h-10 w-full rounded border border-border bg-surface-strong px-3 py-2 text-foreground"
              >
                {seasons.map((item) => (
                  <option key={item.number} value={item.number}>
                    {item.name} ({item.episodes})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {copy.episode}
              <select
                value={episode ?? ""}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="min-h-10 w-full rounded border border-border bg-surface-strong px-3 py-2 text-foreground"
              >
                {Array.from({ length: episodeCount }, (_, index) => index + 1).map((number) => (
                  <option key={number} value={number}>
                    {copy.episode} {number}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <label className="text-sm">{copy.subtitles}</label>
          <select value={subtitleLang} onChange={(e) => setSubtitleLang(e.target.value)} className="min-h-10 rounded border border-border bg-surface-strong px-3 py-2 text-foreground">
            {['auto', 'ar', 'en', 'fr', 'es', 'de', 'ru', 'pt', 'zh', 'ja', 'hi', 'tr'].map((lang) => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
          </select>
          <label className="inline-flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={translateSubs} onChange={(e) => setTranslateSubs(e.target.checked)} />{copy.translate}</label>
        </div>

        <div
          ref={playerRef}
          className={isFullscreen ? "fixed inset-0 z-[100] h-[100dvh] w-screen bg-black" : "relative aspect-video w-full bg-black"}
        >
          <iframe src={src} title="player" className="size-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="eager" referrerPolicy="no-referrer-when-downgrade" onError={() => { setIframeFailed(true); setShowSourceFallback(true); }} />
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? copyFullscreen.exit : copyFullscreen.enter}
            title={isFullscreen ? copyFullscreen.exit : copyFullscreen.enter}
            className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded bg-black/75 text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </button>
          {iframeFailed && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center text-white"><p>{copy.failed}</p><a href={src} target="_blank" rel="noreferrer" className="rounded bg-primary px-4 py-2">{copy.open}</a></div>}
        </div>
        {showSourceFallback && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm" role="status" aria-live="polite">
            <p className="text-muted-foreground">{copy.sourceHint}</p>
            <button type="button" onClick={tryNextSource} className="min-h-10 rounded border border-border px-3 font-semibold transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              {copy.nextSource}: {PLAYER_SOURCES[(PLAYER_SOURCES.findIndex((player) => player.key === source) + 1) % PLAYER_SOURCES.length].label}
            </button>
          </div>
        )}

        <section className="rounded-xl border border-border bg-surface-strong p-4">
          <h2 className="text-lg font-semibold">{copy.official}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.note}</p>
          {detail?.watchProviders?.length ? (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {detail.watchProviders.map((provider, index) => (
                <a key={`${provider.name}-${provider.type}-${index}`} href={provider.link} target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  {provider.logo ? <img src={provider.logo} alt="" className="size-8 rounded-md" /> : null}
                  <span className="flex-1 font-medium">{provider.name}</span>
                  <span className="text-xs text-muted-foreground">{provider.type}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
