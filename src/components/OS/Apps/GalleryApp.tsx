/** @format */

import React, { useState } from "react";
import { projects } from "@/components/JSON/projects";
import { motion } from "framer-motion";

export const GalleryApp: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  const handleImageClick = (image: string, title: string) => {
    setSelectedImage(image);
    setSelectedTitle(title);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedTitle("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
        Project Gallery
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Browse through screenshots and highlights from my projects
      </p>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleImageClick(project.image, project.title)}>
            <img
              src={`projects/${project.image}`}
              alt={project.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
              <p className="text-white font-semibold text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {project.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}>
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={`projects/${selectedImage}`}
              alt={selectedTitle}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
              <h3 className="text-xl font-semibold text-center">
                {selectedTitle}
              </h3>
            </div>
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 transition-colors">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg text-center">
        <p className="text-gray-700">
          Click on any image to view it in full size
        </p>
      </div>
    </div>
  );
};
