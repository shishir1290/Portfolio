import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Syne, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020817",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shishir.click"),
  title: {
    default: "Md Sadmanur Islam Shishir | Full-Stack WebRTC & Real-Time Socket Developer",
    template: "%s | Shishir",
  },
  description:
    "Full-Stack Web Developer specializing in WebRTC, Socket.io, real-time systems, and scalable applications. Based in Dhaka, Bangladesh.",
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
      "Full-Stack Web Developer specializing in WebRTC, Socket.io, real-time systems, and scalable applications. Based in Dhaka, Bangladesh.",
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
    <html lang="en" className={`scroll-smooth ${bebasNeue.variable} ${syne.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="noise bg-dark antialiased">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
