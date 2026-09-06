import { createFileRoute } from "@tanstack/react-router";
import { fetchHome } from "@/lib/tmdb.functions";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { TopFive } from "@/components/TopFive";
import { Platforms } from "@/components/Platforms";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  loader: async () => fetchHome(),
  head: () => ({
    meta: [
      { title: "ANCY — Movies & Series" },
      {
        name: "description",
        content: "ANCY — A simple guide to movies and series: trending, top rated, and external watch links.",
      },
      { property: "og:title", content: "ANCY — Movies & Series" },
      {
        property: "og:description",
        content: "Discover popular movies and series with external watch links.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  const [language, setLanguage] = useState("en");
  const mosaic = [...data.topRated, ...data.popularMovies, ...data.popularTv].filter((item) => item.poster).slice(0, 40);

  useEffect(() => setLanguage(window.localStorage.getItem("ancy:lang") || "en"), []);
  const copy = language === "ar"
    ? { art: "فن المشاهدة", welcome: "مرحباً بك في ANCY.", intro: "مجموعة مختارة بعناية من القصص، لليالي التي تريد أن تتذكرها.", explore: "استكشف المجموعة", note: "سينما مختارة، أينما كنت", pride: "لبناني وبفخر" }
    : language === "fr"
      ? { art: "L'art de regarder", welcome: "Bienvenue sur ANCY.", intro: "Une collection réfléchie d'histoires, choisies pour les nuits dont vous vous souviendrez.", explore: "Explorer la collection", note: "Un cinéma choisi, où que vous soyez", pride: "Libanais, et fier de l'être" }
      : { art: "The art of watching", welcome: "Welcome to ANCY.", intro: "A considered collection of stories, chosen for the nights you want to remember.", explore: "Explore the collection", note: "Curated cinema, wherever you are", pride: "Lebanese, and proud" };

  return (
    <div className="pb-4">
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden border-b border-white/10 px-5 pb-12 pt-28 sm:px-10 sm:pb-16 lg:px-16">
        <div className="absolute inset-0 -z-20 grid grid-cols-4 gap-1 overflow-hidden opacity-55 sm:grid-cols-6 lg:grid-cols-8">
          {mosaic.map((item) => (
            <img key={item.id} src={item.poster || ""} alt="" className="h-full min-h-40 w-full object-cover grayscale-[0.2] transition-transform duration-700 hover:scale-105" />
          ))}
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,.98)_0%,rgba(8,9,11,.82)_42%,rgba(8,9,11,.48)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#08090b_0%,rgba(8,9,11,.15)_65%,rgba(8,9,11,.6)_100%)]" />
        <div className="max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-10 bg-gold" />
            {copy.art}
          </p>
          <h1 className="max-w-2xl text-6xl font-semibold leading-[0.92] tracking-tight text-white sm:text-8xl">
            {copy.welcome.replace("ANCY.", "")}<span className="font-normal italic text-gold">ANCY.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
            {copy.intro}
          </p>
          <a
            href="#collection"
            className="mt-9 inline-flex items-center gap-3 border border-gold bg-gold px-6 py-3.5 text-sm font-bold text-black transition hover:bg-white hover:border-white"
          >
            {copy.explore}
            <ArrowRight className="size-4" />
          </a>
          <div className="mt-16 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/45">
            <ArrowDown className="size-4 text-gold" />
            {copy.note}
          </div>
          <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-gold/80">{copy.pride}</p>
        </div>
      </section>
      <div id="collection">
        <Hero items={data.hero} />
        <TopFive title="Top Movies This Week" items={data.topMoviesWeek} />
        <TopFive title="Top TV This Week" items={data.topTvWeek} />
        <Platforms />
        <MediaRow title="Top Rated Movies" items={data.topRated} moreTo="/top-rated" />
        <MediaRow title="Popular Movies" items={data.popularMovies} moreTo="/movies" />
        <MediaRow title="Popular TV" items={data.popularTv} moreTo="/series" />
        <MediaRow title="Now Playing" items={data.nowPlaying} />
      </div>
    </div>
  );
}
