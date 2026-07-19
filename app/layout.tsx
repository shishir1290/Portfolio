import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020817",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shishir.click"),
  title: {
    default: "Md Sadmanur Islam Shishir | Full-Stack Developer",
    template: "%s | Shishir",
  },
  description:
    "Full-Stack Web Developer in Dhaka, Bangladesh. Specializing in Next.js, Node.js, WebRTC, real-time systems, and scalable web applications.",
  keywords: [
    "Full-Stack Developer",
    "Web Developer",
    "Software Engineer",
    "WebRTC",
    "Next.js",
    "React",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "Bangladesh",
    "Dhaka",
    "Shishir",
    "Md Sadmanur Islam Shishir",
    "Portfolio",
    "Frontend Developer",
    "Backend Developer",
    "Nest.js",
    "Golang",
    "Go Developer",
    "Socket.io",
    "Real-Time Applications",
    "WebRTC Engineer",
    "RTMP",
    "HLS Streaming",
    "FFmpeg",
    "PostgreSQL",
    "MongoDB",
    "Prisma ORM",
    "Docker",
    "Nginx",
    "RESTful APIs",
    "Responsive Web Design",
    "UI/UX Developer",
  ],
  authors: [{ name: "Md Sadmanur Islam Shishir", url: "https://shishir.click" }],
  creator: "Md Sadmanur Islam Shishir",
  publisher: "Md Sadmanur Islam Shishir",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/shishir.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Md Sadmanur Islam Shishir | Full-Stack Developer",
    description:
      "Full-Stack Web Developer in Dhaka, Bangladesh. Specializing in Next.js, Node.js, WebRTC, real-time systems, and scalable web applications.",
    url: "https://shishir.click",
    siteName: "Shishir — Portfolio",
    images: [
      {
        url: "/shishir.png",
        width: 1200,
        height: 630,
        alt: "Md Sadmanur Islam Shishir — Full-Stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Md Sadmanur Islam Shishir | Full-Stack Developer",
    description:
      "Full-Stack Web Developer specializing in scalable applications, real-time systems, and WebRTC.",
    images: ["/shishir.png"],
  },
  alternates: {
    canonical: "https://shishir.click",
  },
  verification: {
    google: "kgRYRHOnCZ28DeLuYAczml10Xy6QT6CyOnBZ3vs_mkI",
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Md Sadmanur Islam Shishir",
  url: "https://shishir.click",
  jobTitle: "Full-Stack Web Developer",
  email: "shishir1290@gmail.com",
  telephone: "+8801946432534",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Konabari, Gazipur",
    addressCountry: "Bangladesh",
  },
  sameAs: [],
  knowsAbout: [
    "Full-Stack Development",
    "Next.js",
    "React",
    "Node.js",
    "WebRTC",
    "TypeScript",
    "JavaScript",
    "UI/UX Design",
  ],
};

import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="noise bg-dark antialiased">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
