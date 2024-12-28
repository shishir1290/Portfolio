import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { blogPostsDetails } from "@/components/JSON/blogPostsDetails";

interface BlogPostProps {
  post: {
    slug: string;
    title: string;
    content: {
      type: string;
      content?: string;
      src?: string;
      alt?: string;
      language?: string;
      caption?: string;
      title?: string;
      abstract?: string;
      sections?: { heading: string; content: string }[];
      keywords?: string[];
    }[];
  };
}

// Dynamic route to handle each blog post based on slug
const BlogPost = ({ post }: BlogPostProps) => {
  const router = useRouter();
  const [copiedDetails, setCopiedDetails] = useState<{
    [key: number]: boolean;
  }>({});

  if (router.isFallback) {
    return <div>Loading...</div>;
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

  const handleCopy = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedDetails((prevState) => ({
      ...prevState,
      [index]: true,
    }));
    setTimeout(() => {
      setCopiedDetails((prevState) => ({
        ...prevState,
        [index]: false,
      }));
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        {post.title}
      </h1>

      <div className="prose lg:prose-xl">
        {post.content.map((block, index) => {
          if (block.type === "text") {
            return <p key={index}>{block.content}</p>;
          } else if (block.type === "image") {
            return (
              <div key={index} className="flex justify-center mb-8">
                <Image
                  src={block.src || ""}
                  alt={block.alt || "Image"}
                  width={800}
                  height={450}
                  className="rounded-lg shadow-lg"
                />
              </div>
            );
          } else if (block.type === "code") {
            return (
              <div key={index} className="mb-4 relative">
                <pre className="bg-gray-800 text-white rounded-md overflow-x-auto p-4">
                  <code>{block.content}</code>
                </pre>
                {block.caption && (
                  <p className="text-sm text-gray-500 mt-2">{block.caption}</p>
                )}
                <button
                  onClick={() => handleCopy(index, block.content || "")}
                  className="absolute top-4 right-4 text-white bg-gray-500 hover:bg-gray-600 p-2 rounded-md"
                >
                  {copiedDetails[index] ? (
                    <i className="fas fa-check"> Copied</i>
                  ) : (
                    <i className="fas fa-copy"> Copy</i>
                  )}
                </button>
              </div>
            );
          } else if (block.type === "research") {
            return (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold">{block.title}</h2>
                <p className="italic">{block.abstract}</p>
                {block.sections &&
                  block.sections.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="text-xl font-semibold mt-4">
                        {section.heading}
                      </h3>
                      <p>{section.content}</p>
                    </div>
                  ))}
                {block.keywords && (
                  <p className="mt-4">
                    <strong>Keywords:</strong> {block.keywords.join(", ")}
                  </p>
                )}
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
    fallback: true,
  };
};

// GetStaticProps to fetch the content of the blog post
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params!;

  const post = blogPostsDetails.find((p) => p.slug === slug);

  return {
    props: {
      post: post || null,
    },
  };
};

export default BlogPost;
