/** @format */

import React from "react";
import { FaDownload, FaFilePdf } from "react-icons/fa";

export const ResumeApp: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Resume</h1>
        <a
          href="/image/CV.pdf"
          download
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <FaDownload />
          <span>Download PDF</span>
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          src="/image/CV.pdf"
          className="w-full h-full"
          title="Resume PDF"
        />
      </div>

      {/* Fallback for browsers that don't support iframe */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Can't view the PDF? Download it directly:
        </p>
        <a
          href="/image/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
          <FaFilePdf />
          <span>Open in New Tab</span>
        </a>
      </div>
    </div>
  );
};
