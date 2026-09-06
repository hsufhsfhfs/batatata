import { useCallback, useEffect, useState } from "react";
import { readFavorites, writeFavorites } from "@/lib/media";

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readFavorites());
    const sync = () => setIds(readFavorites());
    window.addEventListener("orxa:favorites", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("orxa:favorites", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    writeFavorites(next);
    setIds(next);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, has };
}
