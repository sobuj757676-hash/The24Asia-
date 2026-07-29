import Link from "next/link";

/**
 * Root fallback for paths outside any locale. Renders minimal HTML because
 * this app has no non-localized root layout.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Page not found
          </h1>
          <p style={{ color: "#64748b" }}>
            The page you are looking for does not exist.
          </p>
          <Link href="/" style={{ color: "#059669", fontWeight: 600 }}>
            Go to home
          </Link>
        </div>
      </body>
    </html>
  );
}
