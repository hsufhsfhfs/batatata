export type MediaKind = "movie" | "tv";

export type MediaItem = {
  id: string;
  tmdbId: number;
  kind: MediaKind;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  logo?: string | null;
  rating: number;
  year: string;
  genres: string[];
};

export type MediaDetail = MediaItem & {
  runtime: string | null;
  tagline: string | null;
  seasons: { number: number; name: string; episodes: number }[];
  cast: { id: number; name: string; character: string; photo: string | null }[];
  similar: MediaItem[];
};

export function decodeId(id: string): { kind: MediaKind; tmdbId: number } {
  const clean = decodeURIComponent(id);
  const [prefix, rest] = clean.split(":");
  return { kind: prefix.endsWith("tv") ? "tv" : "movie", tmdbId: Number(rest) };
}

export const PLAYER_SOURCES = [
  { key: "superembed", label: "MultiEmbed" },
  { key: "twoembed", label: "2Embed" },
  { key: "vidsrcto", label: "VidSrc.to" },
] as const;

export type PlayerSourceKey = (typeof PLAYER_SOURCES)[number]["key"];

export function embedUrl(
  source: PlayerSourceKey,
  kind: MediaKind,
  tmdbId: number,
  season?: number,
  episode?: number,
  subtitleLang?: string | null,
  translateSubs?: boolean,
) {
  const isEpisode = kind === "tv" && season && episode;
  const options = new URLSearchParams();
  if (subtitleLang) {
    options.set("lang", subtitleLang);
    options.set("sub_lang", subtitleLang);
    options.set("ds_lang", subtitleLang);
  }
  if (translateSubs) options.set("translate_subs", "1");
  const appendOptions = (url: string) => {
    const query = options.toString();
    return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
  };

  switch (source) {
    case "twoembed":
      return appendOptions(
        kind === "tv" && isEpisode
          ? `https://www.2embed.cc/embedtv/${tmdbId}?s=${season}&e=${episode}`
          : `https://www.2embed.cc/embed/${tmdbId}`,
      );
    case "vidsrcto":
      return appendOptions(isEpisode
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.to/embed/${kind}/${tmdbId}`);
    default:
      return appendOptions(
        `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${isEpisode ? `&s=${season}&e=${episode}` : ""}`,
      );
  }
}

const FAV_KEY = "orxa:favorites";

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]) {
  window.localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("orxa:favorites"));
}
