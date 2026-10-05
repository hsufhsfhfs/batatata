import { useEffect, useState } from "react";

export function Footer() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const updateLanguage = () => setLanguage(window.localStorage.getItem("ancy:lang") || "en");
    updateLanguage();
    window.addEventListener("ancy:language", updateLanguage);
    return () => window.removeEventListener("ancy:language", updateLanguage);
  }, []);

  const tmdbLabel =
    language === "ar"
      ? "اختيارات ANCY مدعومة ببيانات TMDB"
      : language === "fr"
        ? "La sélection ANCY, avec les données TMDB"
        : "ANCY curation, powered by TMDB";
  const pride =
    language === "ar"
      ? "لبناني وبفخر"
      : language === "fr"
        ? "Libanais, et fier de l'être"
        : "Lebanese, and proud";

  return (
    <footer className="mt-16 border-t border-border px-4 py-10 text-center text-xs leading-relaxed text-muted-foreground sm:px-8">
      <p className="mx-auto max-w-3xl">
        هذا الموقع لا يقوم بتخزين أي ملفات على السيرفر. نحن نوفر فقط روابط لوسائط مستضافة على خدمات
        الطرف الثالث.
      </p>
      <p className="mx-auto mt-2 max-w-3xl">
        This website does not store any files on the server. We only provide links to media hosted on
        third-party services.
      </p>
      <p className="mx-auto mt-2 max-w-3xl">
        Ce site ne stocke aucun fichier sur le serveur. Nous fournissons uniquement des liens vers des
        médias hébergés par des services tiers.
      </p>
      <span className="mt-5 inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-[0.68rem] font-semibold tracking-wide text-foreground/75">
        {tmdbLabel}
      </span>
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold/80">{pride}</p>
      <p className="mt-6 text-[0.68rem] tracking-wide text-muted-foreground/80">
        Made by{" "}
        <a
          href="https://www.linkedin.com/in/anthonycharbelrouhanayounes"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-foreground/80 underline decoration-border underline-offset-4 transition hover:text-foreground"
        >
          Anthony-Charbel Rouhana Younes
        </a>
      </p>
    </footer>
  );
}
