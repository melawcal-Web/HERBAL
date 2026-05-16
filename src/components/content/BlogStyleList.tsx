import Link from "next/link";
import { pickDemoImage } from "@/lib/demo-placeholders";
import { publicDisplayImageUrl } from "@/lib/blob-image-url";

export type BlogStyleListItem = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  date: Date;
  kindLabel: string;
  category?: string | null;
};

function cardImageUrl(url: string | null | undefined, seed: string): string {
  const u = url?.trim();
  if (u?.startsWith("https://")) return publicDisplayImageUrl(u);
  return pickDemoImage(seed, "herbal");
}

export function BlogStyleList({ items, emptyMessage }: { items: BlogStyleListItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="mt-10 rounded-2xl border border-dashed border-herbal-200 bg-white/60 py-12 text-center text-slate-600">{emptyMessage}</p>;
  }

  return (
    <div className="mt-10 space-y-0">
      {items.map((item, index) => (
        <article
          key={item.id}
          className={`group flex flex-col gap-5 py-10 sm:flex-row sm:items-stretch sm:gap-8 ${
            index > 0 ? "border-t border-herbal-100" : ""
          }`}
        >
          <Link
            href={item.href}
            className="relative block shrink-0 overflow-hidden rounded-xl bg-herbal-50 sm:w-[min(42%,320px)]"
          >
            <div className="aspect-[16/11] w-full sm:aspect-[4/3] sm:h-full sm:min-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardImageUrl(item.imageUrl, item.id)}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-center text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-herbal-700/85">
              <time dateTime={item.date.toISOString()}>
                {item.date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
              </time>
              <span className="mx-2 text-herbal-300">·</span>
              {item.kindLabel}
              {item.category ? (
                <>
                  <span className="mx-2 text-herbal-300">·</span>
                  {item.category}
                </>
              ) : null}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold leading-snug text-herbal-900 transition group-hover:text-herbal-700 sm:text-[1.65rem]">
              <Link href={item.href} className="hover:underline">
                {item.title}
              </Link>
            </h2>
            <p className="mt-3 line-clamp-3 text-base leading-relaxed text-slate-600">{item.excerpt}</p>
            <Link
              href={item.href}
              className="mt-4 inline-flex text-sm font-semibold text-herbal-700 underline-offset-4 hover:underline"
            >
              המשך קריאה
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
