import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const blogPosts = [
  {
    title: "How to Build a Responsive Web Application with Next.js",
    image: "/images/nextjs-app.png",
    description:
      "In this post, I will walk you through the process of creating a simple, responsive web application using Next.js. Next.js allows you to build fast, SEO-friendly websites with minimal configuration.",
    link: "/blog/how-to-build-nextjs-app",
  },
  {
    title: "The Power of Tailwind CSS for Rapid Prototyping",
    image: "/images/tailwind-design.png",
    description:
      "Tailwind CSS is an incredible utility-first CSS framework that allows you to build stunning web designs quickly. In this post, I'll show you how Tailwind makes prototyping faster and easier, especially for developers who prefer a minimalistic approach.",
    link: "/blog/tailwind-for-prototyping",
  },
  {
    title: "Understanding React Hooks: A Complete Guide",
    image: "/images/react-hooks.png",
    description:
      "React Hooks have revolutionized how we write React components. In this blog post, we’ll explore the most commonly used hooks, how they work, and how they can help you write cleaner and more efficient code.",
    link: "/blog/react-hooks-guide",
  },
  {
    title: "The Importance of Web Accessibility: Best Practices",
    image: "/images/web-accessibility.png",
    description:
      "Web accessibility is a vital part of modern web development. Ensuring that your site is usable by people with disabilities is not only ethical but also increases your site's reach. This post discusses best practices for making your website more accessible.",
    link: "/blog/web-accessibility-best-practices",
  },
];

const Blog = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 animate__animated animate__fadeIn">
        Welcome to My Blog
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {blogPosts.map((post, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {post.title}
            </h2>
            <div className="mb-4">
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={450}
                className="rounded-lg shadow-md"
              />
            </div>
            <p className="text-gray-600 mb-4">{post.description}</p>
            <Link
              href={post.link}
              className="text-orange-500 font-semibold hover:text-orange-600"
            >
              Read More →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
