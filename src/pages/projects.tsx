import { useState } from "react";
import { projects } from "@/components/JSON/projects";
import { FaGithub } from "react-icons/fa";

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] =
    useState<any>(null);
  const [copiedDetails, setCopiedDetails] = useState<{
    [key: number]: boolean;
  }>({}); // Track copied state for each code block

  // Open modal and set selected project details
  const handlePopup = (details: any) => {
    setSelectedProjectDetails(details);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProjectDetails(null);
  };

  // Close modal when clicking outside the modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  // Handle copying code and updating state for copied details
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
    }, 3000); // Reset after 3 seconds
  };

  return (
    <div className="animate-slide-in py-10 px-5">
      <h1 className="text-4xl font-bold mb-6 text-center">My Projects</h1>
      <p className="text-lg mb-10 text-center">
        Here are some of the projects I've worked on, showcasing my skills and
        experience.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300"
          >
            <img
              src={`projects/${project.image}`}
              alt={project.title}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
            <p className="text-base text-gray-700 mb-4">
              {project.description}
            </p>

            <div className="flex justify-between">
              {/* Link to the project */}
              {project?.link && (
                <a
                  href={project?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Live view
                </a>
              )}

              {/* GitHub Link */}
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900"
              >
                <div className="flex items-center justify-center gap-1">
                  <FaGithub />
                  <p>GitHub</p>
                </div>
              </a>

              {/* View Details Button */}
              <button
                onClick={() => handlePopup(project.details)}
                className="text-gray-700 hover:text-gray-900"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for project details */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-lg p-6 sm:w-3/4 md:w-2/3 relative  overflow-y-scroll max-w-full  h-4/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content */}
            <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
            {/* Render details */}
            {selectedProjectDetails?.map((detail: any, index: number) => {
              if (detail.type === "text") {
                return (
                  <p key={index} className="text-lg text-gray-700 mb-4">
                    {detail.content}
                  </p>
                );
              }
              if (detail.type === "image") {
                return (
                  <div key={index} className="mb-4">
                    <img
                      src={`projects/${detail.content}`}
                      alt={detail.caption}
                      className="w-full h-auto rounded-md"
                    />
                    {detail.caption && (
                      <p className="text-sm text-gray-500 mt-2">
                        {detail.caption}
                      </p>
                    )}
                  </div>
                );
              }
              if (detail.type === "code") {
                return (
                  <div key={index} className="mb-4 relative">
                    <pre className="bg-gray-800 text-white rounded-md overflow-x-auto">
                      <code>{detail.content}</code>
                    </pre>
                    {detail.caption && (
                      <p className="text-sm text-gray-500 mt-2">
                        {detail.caption}
                      </p>
                    )}
                    <button
                      onClick={() => handleCopy(index, detail.content)}
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
              }
              return null;
            })}

            {/* Close Modal Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
