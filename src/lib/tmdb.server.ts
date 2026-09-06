const BASE = "https://api.themoviedb.org/3";

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
  seasons: { number: number; name: string; episodes: number }[];
  cast: { id: number; name: string; character: string; photo: string | null }[];
  similar: MediaItem[];
  tagline: string | null;
  watchProviders: {
    name: string;
    logo: string | null;
    type: "stream" | "rent" | "buy" | "free" | "ads";
    link: string;
  }[];
};

export function img(path: string | null | undefined, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

function readTmdbToken() {
  const runtimeEnv = (globalThis as typeof globalThis & {
    __env__?: { TMDB_READ_TOKEN?: string };
  }).__env__;
  return runtimeEnv?.TMDB_READ_TOKEN || process.env["TMDB_READ_TOKEN"];
}

export function encodeId(kind: MediaKind, tmdbId: number) {
  return `vidsrc-${kind}:${tmdbId}`;
}

export function decodeId(id: string): { kind: MediaKind; tmdbId: number } {
  const clean = decodeURIComponent(id);
  const [prefix, rest] = clean.split(":");
  const kind: MediaKind = prefix.endsWith("tv") ? "tv" : "movie";
  return { kind, tmdbId: Number(rest) };
}

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = readTmdbToken();
  if (!token) {
    console.warn("TMDB_READ_TOKEN is not set — returning empty response for", path);
    return {} as T;
  }
  const url = new URL(BASE + path);
  url.searchParams.set("language", "en");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return (await res.json()) as T;
}

type RawItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
};

let genreCache: Record<string, string> | null = null;

async function genreMap(): Promise<Record<string, string>> {
  if (genreCache) return genreCache;
  try {
    const [m, t] = await Promise.all([
      tmdb<{ genres: { id: number; name: string }[] }>("/genre/movie/list"),
      tmdb<{ genres: { id: number; name: string }[] }>("/genre/tv/list"),
    ]);
    const map: Record<string, string> = {};
    for (const g of [...(m.genres || []), ...(t.genres || [])]) map[String(g.id)] = g.name;
    genreCache = map;
    return map;
  } catch (e) {
    console.warn("genreMap fetch failed", e?.message ?? e);
    genreCache = {};
    return {};
  }
}

function normalize(raw: RawItem, fallbackKind: MediaKind, genres: Record<string, string>): MediaItem {
  const kind: MediaKind = (raw.media_type === "tv" || raw.media_type === "movie"
    ? raw.media_type
    : fallbackKind) as MediaKind;
  const date = raw.release_date || raw.first_air_date || "";
  return {
    id: encodeId(kind, raw.id),
    tmdbId: raw.id,
    kind,
    title: raw.title || raw.name || "",
    overview: raw.overview || "",
    poster: img(raw.poster_path, "w500"),
    backdrop: img(raw.backdrop_path, "w1280"),
    rating: Math.round((raw.vote_average || 0) * 10) / 10,
    year: date ? date.slice(0, 4) : "",
    genres: (raw.genres?.map((g) => g.name) ??
      (raw.genre_ids || []).map((id) => genres[String(id)]).filter(Boolean)) as string[],
  };
}

async function list(path: string, kind: MediaKind, params: Record<string, string | number> = {}) {
  try {
    const [genres, data] = await Promise.all([
      genreMap(),
      tmdb<{ results: RawItem[] }>(path, params),
    ]);
    return (data.results || [])
      .filter((r) => r.poster_path || r.backdrop_path)
      .map((r) => normalize(r, kind, genres));
  } catch (e) {
    console.warn("tmdb list error", path, e?.message ?? e);
    return [];
  }
}

async function withLogo(item: MediaItem): Promise<MediaItem> {
  try {
    const data = await tmdb<{ logos: { file_path: string; iso_639_1: string }[] }>(
      `/${item.kind}/${item.tmdbId}/images`,
      { include_image_language: "ar,en,null" },
    );
    const logo =
      data.logos.find((l) => l.iso_639_1 === "en") ||
      data.logos.find((l) => l.iso_639_1 === "ar") ||
      data.logos[0];
    return { ...item, logo: img(logo?.file_path, "w500") };
  } catch {
    return { ...item, logo: null };
  }
}

export async function getHome() {
  const [trendingMovies, trendingTv, topMovies, topTv, popularMovies, popularTv, nowPlaying] =
    await Promise.all([
      list("/trending/movie/week", "movie"),
      list("/trending/tv/week", "tv"),
      list("/movie/top_rated", "movie"),
      list("/tv/top_rated", "tv"),
      list("/movie/popular", "movie"),
      list("/tv/popular", "tv"),
      list("/movie/now_playing", "movie"),
    ]);

  const heroSource = [
    trendingMovies[0],
    trendingTv[0],
    trendingMovies[1],
    trendingTv[1],
    trendingMovies[2],
    trendingTv[2],
  ].filter(Boolean);
  const hero = await Promise.all(heroSource.map(withLogo));

  return {
    unavailable: ![trendingMovies, trendingTv, topMovies, topTv, popularMovies, popularTv, nowPlaying].some((items) => items.length),
    hero,
    topMoviesWeek: trendingMovies.slice(0, 5),
    topTvWeek: trendingTv.slice(0, 5),
    topRated: [...topMovies, ...topTv]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 18),
    popularMovies: popularMovies.slice(0, 18),
    popularTv: popularTv.slice(0, 18),
    nowPlaying: nowPlaying.slice(0, 18),
  };
}

export async function getBrowse(kind: MediaKind) {
  const [trending, popular, topRated, upcoming] = await Promise.all([
    list(`/trending/${kind}/week`, kind),
    list(`/${kind}/popular`, kind),
    list(`/${kind}/top_rated`, kind),
    list(kind === "movie" ? "/movie/upcoming" : "/tv/on_the_air", kind),
  ]);
  const hero = await Promise.all(trending.slice(0, 5).map(withLogo));
  return {
    unavailable: ![trending, popular, topRated, upcoming].some((items) => items.length),
    hero,
    rows: [
      { title: kind === "movie" ? "Trending" : "Trending", items: trending.slice(0, 18) },
      { title: "Popular", items: popular.slice(0, 18) },
      { title: "Top Rated", items: topRated.slice(0, 18) },
      {
        title: kind === "movie" ? "Upcoming" : "On The Air",
        items: upcoming.slice(0, 18),
      },
    ],
  };
}

export async function getTopRated(page = 1) {
  const [movies, tv] = await Promise.all([
    list("/movie/top_rated", "movie", { page }),
    list("/tv/top_rated", "tv", { page }),
  ]);
  return [...movies, ...tv].sort((a, b) => b.rating - a.rating);
}

export async function search(query: string) {
  if (!query.trim()) return [];
  try {
    const genres = await genreMap();
    const data = await tmdb<{ results: RawItem[] }>("/search/multi", { query, page: 1 });
    const results = data.results || [];
    return results
      .filter((r) => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path)
      .map((r) => normalize(r, "movie", genres));
  } catch (e) {
    console.warn("search failed", e?.message ?? e);
    return [];
  }
}

const PROVIDERS: Record<string, { id: number; name: string; logo: string }> = {
  netflix: { id: 8, name: "Netflix", logo: "/providers/netflix.svg" },
  hbomax: { id: 1899, name: "HBO Max", logo: "/providers/hbomax.svg" },
  appletv: { id: 350, name: "Apple TV+", logo: "/providers/appletv.svg" },
  primevideo: { id: 9, name: "Prime Video", logo: "/providers/primevideo.svg" },
  hulu: { id: 15, name: "Hulu", logo: "/providers/hulu.svg" },
  paramountplus: { id: 531, name: "Paramount+", logo: "/providers/paramountplus.svg" },
  disney: { id: 337, name: "Disney+", logo: "/providers/disney.svg" },
  peacock: { id: 386, name: "Peacock", logo: "/providers/peacock.svg" },
};

export function platformList() {
  return Object.entries(PROVIDERS).map(([slug, p]) => ({ slug, name: p.name, logo: p.logo }));
}

export async function getPlatform(slug: string) {
  const provider = PROVIDERS[slug];
  if (!provider) return null;
  const params = {
    with_watch_providers: provider.id,
    watch_region: "US",
    sort_by: "popularity.desc",
  };
  const [movies, tv] = await Promise.all([
    list("/discover/movie", "movie", params),
    list("/discover/tv", "tv", params),
  ]);
  return { name: provider.name, logo: provider.logo, movies, tv };
}

export async function getDetail(id: string): Promise<MediaDetail> {
  const { kind, tmdbId } = decodeId(id);
  if (!readTmdbToken()) {
    console.warn("getDetail: TMDB_READ_TOKEN missing — returning empty detail for", id);
    const base: MediaItem = {
      id,
      tmdbId: tmdbId,
      kind,
      title: "",
      overview: "",
      poster: null,
      backdrop: null,
      rating: 0,
      year: "",
      genres: [],
    };
    return {
      ...base,
      runtime: null,
      seasons: [],
      cast: [],
      similar: [],
      tagline: null,
      watchProviders: [],
    };
  }
  const genres = await genreMap();
  const [detail, credits, similar, images, providers] = await Promise.all([
    tmdb<any>(`/${kind}/${tmdbId}`),
    tmdb<any>(`/${kind}/${tmdbId}/credits`),
    tmdb<{ results: RawItem[] }>(`/${kind}/${tmdbId}/recommendations`).catch(() => ({
      results: [],
    })),
    tmdb<any>(`/${kind}/${tmdbId}/images`, { include_image_language: "ar,en,null" }).catch(() => ({
      logos: [],
    })),
    tmdb<any>(`/${kind}/${tmdbId}/watch/providers`).catch(() => ({ results: {} })),
  ]);

  const base = normalize(detail, kind, genres);
  const logos = images.logos || [];
  const logo =
    logos.find((l: any) => l.iso_639_1 === "en") ||
    logos.find((l: any) => l.iso_639_1 === "ar") ||
    logos[0];

  const runtime =
    kind === "movie"
      ? detail.runtime
        ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m`
        : null
      : detail.number_of_seasons
        ? `${detail.number_of_seasons} seasons`
        : null;

  const providerRegion = providers.results?.US || Object.values(providers.results || {})[0] || {};
  const watchProviders = ([
    ["stream", providerRegion.flatrate],
    ["free", providerRegion.free],
    ["ads", providerRegion.ads],
    ["rent", providerRegion.rent],
    ["buy", providerRegion.buy],
  ] as const).flatMap(([type, items]) =>
    (items || []).map((provider: any) => ({
      name: provider.provider_name,
      logo: img(provider.logo_path, "w92"),
      type,
      link: providerRegion.link || `https://www.justwatch.com/us/search?q=${encodeURIComponent(base.title)}`,
    })),
  );

  return {
    ...base,
    logo: img(logo?.file_path, "w500"),
    tagline: detail.tagline || null,
    runtime,
    seasons: (detail.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        number: s.season_number,
        name: s.name,
        episodes: s.episode_count,
      })),
    cast: (credits.cast || []).slice(0, 18).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photo: img(c.profile_path, "w185"),
    })),
    similar: similar.results
      .filter((r) => r.poster_path)
      .slice(0, 12)
      .map((r) => normalize(r, kind, genres)),
    watchProviders,
  };
}
