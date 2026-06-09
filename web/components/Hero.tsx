import Image from "next/image";

/** Homepage hero banner: the cinematic "chasing the vanishing collection" render with the
 *  title + tagline centered over a dark scrim. The image is decorative; the page's real <h1>
 *  lives here so it stays the document's top heading. */
export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative mb-8 h-[300px] overflow-hidden rounded-xl border-2 border-border sm:h-[380px]">
      <Image
        src="/hero-chase.webp"
        alt="A lone yellow minifigure runs after a stack of toy building-set boxes that is dissolving into the mist — an illustration for 'where is my Lego?'"
        fill
        priority
        sizes="(max-width: 980px) 100vw, 980px"
        className="object-cover object-[50%_35%]"
      />
      {/* dark scrim for text contrast over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:text-sm">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
