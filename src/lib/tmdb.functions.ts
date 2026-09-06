import { createServerFn } from "@tanstack/react-start";
import {
  getBrowse,
  getDetail,
  getHome,
  getPlatform,
  getTopRated,
  search,
} from "./tmdb.server";

export const fetchHome = createServerFn({ method: "GET" }).handler(async () => getHome());

export const fetchMovies = createServerFn({ method: "GET" }).handler(async () =>
  getBrowse("movie"),
);

export const fetchSeries = createServerFn({ method: "GET" }).handler(async () => getBrowse("tv"));

export const fetchTopRated = createServerFn({ method: "GET" }).handler(async () => getTopRated(1));

export const fetchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data }) => getDetail(data.id));

export const fetchSearch = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string }) => ({ query: String(data.query || "") }))
  .handler(async ({ data }) => search(data.query));

export const fetchPlatform = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => getPlatform(data.slug));

export const fetchByIds = createServerFn({ method: "GET" })
  .inputValidator((data: { ids: string[] }) => ({ ids: (data.ids || []).map(String) }))
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.ids.slice(0, 40).map((id) => getDetail(id).catch(() => null)),
    );
    return results.filter(Boolean);
  });
