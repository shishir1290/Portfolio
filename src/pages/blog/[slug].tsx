import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { blogPostsDetails } from "@/components/JSON/blogPostsDetails";

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
  const paths = blogPostsDetails.map((post) => ({
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

  const post = blogPostsDetails.find((p) => p.slug === slug);

  // If no post is found, return a fallback post (or an error message)
  return {
    props: {
      post: post || null, // If the post doesn't exist, pass null to the page
    },
  };
};

export default BlogPost;
