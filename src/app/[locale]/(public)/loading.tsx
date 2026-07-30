import { Container, Section } from "@/components/ui/misc";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/**
 * Streaming placeholder for public pages. Every public route reads from the
 * database, so without this the browser sat on a blank document until the
 * query resolved — on a slow mobile connection that reads as "broken".
 */
export default function PublicLoading() {
  return (
    <Section>
      <Container>
        <span className="sr-only" role="status">
          Loading page
        </span>
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <div className="mt-4 max-w-prose">
          <SkeletonText lines={2} />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-[var(--card)] p-5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <div className="mt-3">
                <SkeletonText lines={2} />
              </div>
              <Skeleton className="mt-4 h-9 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
