export const blogPostsDetails = [
  //My own Blog

  {
    slug: "aiub-campus-life-project",
    title: "AIUB Campus Life: A Digital Showcase of University Spirit",
    content: [
      {
        type: "text",
        content:
          "The AIUB Campus Life project captures the essence of life at the American International University-Bangladesh (AIUB). Designed with modern web technologies like Tailwind CSS, this open-source initiative provides a platform for documenting events, activities, and student experiences.",
      },
      {
        type: "image",
        src: "/blogs/aiubCampusLife.png",
        alt: "AIUB Campus Life Banner",
      },
      {
        type: "image",
        src: "/blogs/aiubCampusLife-2.png",
        alt: "AIUB Campus Life Banner",
      },
      {
        type: "image",
        src: "/blogs/aiubCampusLife-3.png",
        alt: "AIUB Campus Life Banner",
      },
      {
        type: "text",
        content:
          "This project blends dynamic and static content to present university life interactively. It's a tool for student engagement, event documentation, and even collaborative development, making it versatile and impactful.",
      },
      {
        type: "code",
        language: "html",
        content: `
          <div class="bg-green-500 text-white p-6 text-center">
            <h1 class="text-3xl font-semibold">Experience AIUB Like Never Before</h1>
            <p class="mt-2 text-base">Your digital guide to events, activities, and experiences.</p>
          </div>
        `,
      },
      {
        type: "text",
        content:
          "The use of Tailwind CSS ensures that the project is not only visually appealing but also optimized for responsiveness across devices. Its open-source nature allows developers to contribute and expand the project's capabilities.",
      },
      {
        type: "research",
        title: "Digital Platforms for Enhancing University Engagement",
        abstract:
          "This paper explores the use of digital platforms like AIUB Campus Life to foster student engagement and improve university branding. By leveraging modern web technologies, the project demonstrates an effective model for creating interactive, user-friendly university platforms.",
        sections: [
          {
            heading: "Introduction",
            content:
              "Digital platforms play a crucial role in education today. The AIUB Campus Life project is an excellent example of how such tools can document and promote university culture interactively.",
          },
          {
            heading: "Technology Stack and Features",
            content:
              "The project utilizes Tailwind CSS for responsive design, dynamic routing for flexible content presentation, and potential CMS integration for scalability.",
          },
          {
            heading: "Impact and Future Prospects",
            content:
              "Projects like AIUB Campus Life enhance engagement by providing a unified platform for students and alumni. Future improvements could include AI-driven personalization and mobile app integration.",
          },
        ],
        keywords: [
          "Digital Education",
          "Tailwind CSS",
          "University Engagement",
          "Open Source",
        ],
      },
    ],
  },
];
