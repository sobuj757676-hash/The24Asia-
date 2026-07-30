"use client";

/**
 * Last-resort boundary for failures in the root layout itself, where no locale
 * provider, styles or shell are available. It must render its own <html>.
 * Without this, such a failure showed the browser's default error page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "3rem",
              height: "3rem",
              borderRadius: "0.875rem",
              background: "#0d7a5f",
              color: "#fff",
              fontWeight: 800,
              margin: "0 auto 1rem",
            }}
          >
            24
          </p>
          <h1 style={{ fontSize: "1.375rem", margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 1.25rem", color: "#475569", lineHeight: 1.6 }}>
            We hit an unexpected problem loading 24Asia. Please try again — if it keeps
            happening, come back in a few minutes.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Reference: {error.digest}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: "2.75rem",
                padding: "0 1.25rem",
                borderRadius: "0.75rem",
                border: 0,
                background: "#0d7a5f",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* A plain anchor is deliberate: this boundary replaces the root
                layout, so a full document load is the reliable way out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                minHeight: "2.75rem",
                display: "inline-flex",
                alignItems: "center",
                padding: "0 1.25rem",
                borderRadius: "0.75rem",
                border: "1px solid #cbd5e1",
                color: "#0f172a",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to homepage
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
