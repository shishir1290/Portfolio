import Link from "next/link";

export default function NotFound() {
  return (
    <div className="noise bg-dark min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 space-y-6 max-w-md">
        <h1
          className="text-8xl md:text-9xl font-bold gradient-text text-glow tracking-tighter"
          style={{ fontFamily: "Bebas Neue, sans-serif" }}
        >
          404
        </h1>
        <h2
          className="text-2xl font-bold text-white tracking-widest uppercase"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          Page Not Found
        </h2>
        <div className="w-16 h-px bg-primary mx-auto" />
        <p className="text-white/40 text-sm leading-relaxed">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="pt-6">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <span>GO TO HOMEPAGE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
