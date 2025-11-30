/** @format */

import React from "react";
import ContactForm from "@/components/ContactForm";
import { FaFacebook, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import Link from "next/link";

export const ContactApp: React.FC = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
        Get In Touch
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Feel free to reach out for collaborations, opportunities, or just to say
        hello!
      </p>

      {/* Contact Form */}
      <div className="mb-8">
        <ContactForm />
      </div>

      {/* Social Links */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Connect With Me
        </h2>
        <div className="flex justify-center gap-6">
          <Link
            href="https://www.facebook.com/profile.php?id=100011398471238"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group">
            <FaFacebook className="text-4xl text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Facebook</span>
          </Link>

          <Link
            href="https://www.linkedin.com/in/shishir1290/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group">
            <FaLinkedin className="text-4xl text-blue-700 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">LinkedIn</span>
          </Link>

          <Link
            href="https://github.com/shishir1290"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
            <FaGithub className="text-4xl text-gray-800 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">GitHub</span>
          </Link>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <FaEnvelope className="text-orange-600" />
          <p className="text-sm">
            Or email me directly at:{" "}
            <a
              href="mailto:shishir1290@example.com"
              className="font-semibold text-orange-600 hover:underline">
              shishir1290@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
