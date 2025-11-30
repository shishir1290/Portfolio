/** @format */

import React, { useState } from "react";
import { projects } from "@/components/JSON/projects";
import { FaGithub } from "react-icons/fa";

export const ProjectsApp: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] =
    useState<any>(null);
  const [copiedDetails, setCopiedDetails] = useState<{
    [key: number]: boolean;
  }>({});

  const handlePopup = (details: any) => {
    setSelectedProjectDetails(details);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProjectDetails(null);
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">My Projects</h1>
      <p className="text-base mb-6 text-center text-gray-600">
        Here are some of the projects I've worked on, showcasing my skills and
        experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 p-4 rounded-lg shadow hover:shadow-lg transition duration-300">
            <img
              src={`projects/${project.image}`}
              alt={project.title}
              className="w-full h-32 object-cover rounded-md mb-3"
            />
            <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
            <p className="text-sm text-gray-700 mb-3">{project.description}</p>

            <div className="flex justify-between items-center">
              {project?.link && (
                <a
                  href={project?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm">
                  Live view
                </a>
              )}

              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <FaGithub />
                  <p>GitHub</p>
                </div>
              </a>

              <button
                onClick={() => handlePopup(project.details)}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium">
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
          onClick={handleBackdropClick}>
          <div
            className="bg-white rounded-lg p-6 w-11/12 md:w-3/4 lg:w-2/3 relative overflow-y-scroll max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
            {selectedProjectDetails?.map((detail: any, index: number) => {
              if (detail.type === "text") {
                return (
                  <p key={index} className="text-base text-gray-700 mb-4">
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
                    <pre className="bg-gray-800 text-white rounded-md overflow-x-auto p-4">
                      <code>{detail.content}</code>
                    </pre>
                    {detail.caption && (
                      <p className="text-sm text-gray-500 mt-2">
                        {detail.caption}
                      </p>
                    )}
                    <button
                      onClick={() => handleCopy(index, detail.content)}
                      className="absolute top-4 right-4 text-white bg-gray-500 hover:bg-gray-600 p-2 rounded-md text-sm">
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

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
