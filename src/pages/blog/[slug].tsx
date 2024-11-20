import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Sample blog data with alternating text and image blocks
const blogPosts = [
  {
    slug: "how-to-build-nextjs-app",
    title: "How to Build a Responsive Web Application with Next.js",
    content: [
      {
        type: "text",
        content:
          "In this post, I will walk you through the process of creating a simple, responsive web application using Next.js. Next.js allows you to build fast, SEO-friendly websites with minimal configuration. Here's how you can get started...",
      },
      { type: "image", src: "/images/nextjs-app.png", alt: "Next.js App" },
      {
        type: "text",
        content:
          "Next.js is a powerful React framework that supports both static site generation (SSG) and server-side rendering (SSR). It provides an excellent developer experience, optimized for building fast websites.",
      },
      {
        type: "image",
        src: "/images/nextjs-features.png",
        alt: "Next.js Features",
      },
      {
        type: "text",
        content:
          "By using Next.js, you can automatically optimize images, create custom server-side routes, and much more. Let's take a closer look at how we can implement it in your project.",
      },
    ],
  },
  {
    slug: "tailwind-for-prototyping",
    title: "The Power of Tailwind CSS for Rapid Prototyping",
    content: [
      {
        type: "text",
        content:
          "Tailwind CSS is an incredible utility-first CSS framework that allows you to build stunning web designs quickly. In this post, I'll show you how Tailwind makes prototyping faster and easier, especially for developers who prefer a minimalistic approach.",
      },
      {
        type: "image",
        src: "/images/tailwind-design.png",
        alt: "Tailwind Design",
      },
      {
        type: "text",
        content:
          "With Tailwind, you can quickly apply pre-designed utility classes to your HTML elements, making it super easy to prototype and build complex layouts in no time.",
      },
      {
        type: "image",
        src: "/images/tailwind-grid.png",
        alt: "Tailwind Grid System",
      },
      {
        type: "text",
        content:
          "Tailwind doesn't force you to follow any design patterns, so you can create unique, custom designs while still benefiting from a utility-first approach.",
      },
    ],
  },
  {
    slug: "web-accessibility-best-practices",
    title: "Web Accessibility: Best Practices for Inclusion",
    content: [
      {
        type: "text",
        content:
          "Web accessibility is a vital part of modern web development. Ensuring that your site is usable by people with disabilities is not only ethical but also increases your site's reach.",
      },
      {
        type: "image",
        src: "/images/web-accessibility.png",
        alt: "Web Accessibility",
      },
      {
        type: "text",
        content:
          "This post discusses best practices for making your website more accessible, from color contrast to keyboard navigation and beyond.",
      },
    ],
  },
  // Add more posts here...
];

// Dynamic route to handle each blog post based on slug
const BlogPost = ({ post }: { post: { title: string; content: any[] } }) => {
  const router = useRouter();

  // Ensure the post is available before rendering
  if (router.isFallback) {
    return <div>Loading...</div>; // Show loading state if the page is being generated
  }

  if (!post) {
    return (
      <div>
        <h1>Post not found</h1>
        <p>Sorry, the requested post does not exist.</p>
      </div>
    );
  }

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        {post.title}
      </h1>

      {/* Render content blocks */}
      <div className="prose lg:prose-xl">
        {post.content.map((block, index) => {
          if (block.type === "text") {
            return <p key={index}>{block.content}</p>;
          } else if (block.type === "image") {
            return (
              <div key={index} className="flex justify-center mb-8">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={800}
                  height={450}
                  className="rounded-lg shadow-lg"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

// GetStaticPaths for static generation
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = blogPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: true, // Set fallback to true so that Next.js can handle the slug dynamically
  };
};

// GetStaticProps to fetch the content of the blog post
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params!;

  const post = blogPosts.find((p) => p.slug === slug);

  // If no post is found, return a fallback post (or an error message)
  return {
    props: {
      post: post || null, // If the post doesn't exist, pass null to the page
    },
  };
};

export default BlogPost;
