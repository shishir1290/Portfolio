export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-primary/30 flex items-center justify-center">
              <span
                className="text-primary text-xs font-bold"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                S
              </span>
            </div>
            <div>
              <p
                className="text-white/60 text-xs tracking-widest"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                MD SADMANUR ISLAM SHISHIR
              </p>
              <p className="text-white/20 text-xs mt-0.5">
                Full-Stack Developer · Dhaka, Bangladesh
              </p>
            </div>
          </div>

          <p
            className="text-white/20 text-xs text-center"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            © {new Date().getFullYear()} All rights reserved
          </p>

          <div className="flex items-center gap-4">
            <a
              href="mailto:shishir1290@gmail.com"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              EMAIL
            </a>
            <span className="text-white/10">·</span>
            <a
              href="tel:+8801946432534"
              className="text-white/30 hover:text-primary transition-colors text-xs"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              PHONE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
