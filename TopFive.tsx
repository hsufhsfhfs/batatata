import { Link } from "@tanstack/react-router";
import type { MediaItem } from "@/lib/media";

export function TopFive({ title, items }: { title: string; items: MediaItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 px-4 text-lg font-bold sm:px-8 sm:text-xl">{title}</h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:px-8">
        {items.slice(0, 5).map((item, i) => (
          <Link
            key={item.id}
            to="/movie/$id"
            params={{ id: item.id }}
            className="group relative flex shrink-0 items-end gap-1"
          >
            <span className="select-none pb-2 text-[5.5rem] font-black leading-none text-transparent [-webkit-text-stroke:2px_var(--color-border)] sm:text-[7rem]">
              {i + 1}
            </span>
            <div className="relative -ms-6 aspect-video w-52 overflow-hidden rounded-xl ring-1 ring-border transition-transform duration-300 group-hover:scale-[1.03] sm:w-64">
              {item.backdrop || item.poster ? (
                <img
                  src={item.backdrop ?? item.poster ?? ""}
                  alt={item.title}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <p className="absolute bottom-2 start-3 line-clamp-1 text-sm font-semibold">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
