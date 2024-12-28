import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { blogPosts } from "@/components/JSON/blogPosts";

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
