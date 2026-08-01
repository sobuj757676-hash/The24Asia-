import Image from "next/image";
import { cn } from "@/lib/utils";
import { accentFor, mediaUrl } from "@/lib/media";

/**
 * Card cover image with a designed fallback.
 *
 * Courses and events have no image column in the schema, and object storage may
 * not be configured yet, so most covers will render the fallback: a
 * category-tinted gradient with the section icon. That is deliberate — it gives
 * every card a visual anchor (the cards were previously a title, one line of
 * text and a button floating in white space) without faking photography or
 * shipping broken image frames.
 */
export function MediaCover({
  storageKey,
  alt,
  seed,
  icon,
  label,
  className,
  priority = false,
}: {
  storageKey?: string | null;
  alt?: string | null;
  /** Drives the fallback gradient so the same item always looks the same. */
  seed?: string | null;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  priority?: boolean;
}) {
  const src = mediaUrl(storageKey);

  return (
    <div
      className={cn(
        "relative aspect-[21/9] w-full overflow-hidden rounded-t-2xl sm:aspect-[16/9]",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
          priority={priority}
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "flex size-full items-center justify-center bg-gradient-to-br",
            accentFor(seed),
          )}
        >
          {/* Subtle texture so the block does not read as a flat colour swatch. */}
          <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:12px_12px]" />
          <div className="relative flex flex-col items-center gap-1.5 text-white/95">
            {icon}
            {label && (
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
