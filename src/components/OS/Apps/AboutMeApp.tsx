/** @format */

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiences } from "@/components/JSON/experiences";
import { skills } from "@/components/JSON/skills";
import { educationHistory } from "@/components/JSON/educationHistory";

export const AboutMeApp: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Introduction */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">About Me</h1>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            Introduction
          </h2>
          <p className="text-base text-gray-700">
            I am a passionate web developer with a strong focus on creating
            user-friendly and responsive websites and applications. With a
            dedication to building clean, modern web experiences, I specialize
            in crafting solutions that enhance usability and performance.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            Technical Expertise
          </h2>
          <p className="text-base text-gray-700 mb-3">
            I have experience working with a variety of front-end and back-end
            technologies, allowing me to create seamless web applications. Some
            of the key technologies I work with include:
          </p>
          <ul className="list-disc pl-5 text-base text-gray-700">
            <li>HTML, CSS, JavaScript</li>
            <li>React, Next.js, Nest.js</li>
            <li>PHP, .Net</li>
            <li>Tailwind CSS</li>
            <li>SQL</li>
            <li>MongoDB</li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            Design Philosophy
          </h2>
          <p className="text-base text-gray-700">
            My design philosophy is rooted in simplicity and accessibility. I
            believe that a well-designed interface should not only be visually
            appealing but also enhance the user experience by being intuitive,
            fast, and easy to navigate.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            Career Goals
          </h2>
          <p className="text-base text-gray-700">
            My goal is to continue growing as a developer by embracing new
            technologies and challenges. I aim to build impactful projects that
            deliver high performance and positive outcomes, while always
            striving for excellence in everything I do.
          </p>
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Education History
        </h2>
        <div className="bg-orange-100 rounded-lg p-6">
          <VerticalTimeline layout="1-column-left">
            {educationHistory.map((edu, index) => (
              <VerticalTimelineElement
                key={index}
                className={
                  index === 0
                    ? "vertical-timeline-element--school"
                    : "vertical-timeline-element--work"
                }
                contentStyle={{
                  background: edu.bgColor,
                  color: "#fff",
                  borderRadius: "10px",
                }}
                contentArrowStyle={{
                  borderRight:
                    index === 0 ? "9px solid #2d3748" : "7px solid #2d3748",
                }}
                iconStyle={{
                  background: edu.iconBg,
                  color: "#000000",
                  fontSize: edu.iconSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #000",
                  fontWeight: "bold",
                }}
                icon={<span>{edu.iconText}</span>}>
                <h3 className="text-lg font-semibold">{edu.title}</h3>
                <hr />
                <h1 className="text-xl font-bold">{edu.institution}</h1>
                <p className="text-sm">{edu.cgpa || edu.gpa}</p>
                <p className="text-sm">{edu.major || edu.group}</p>
                <p className="text-sm">{edu.board}</p>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Skills</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-base text-gray-700">
          {skills.map(({ icon, label, color, isImage }, index) => (
            <motion.li
              key={index}
              className={`flex items-center space-x-2 hover:${color} hover:scale-105 transition-all duration-300 ease-in-out`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}>
              {isImage ? (
                <div className={`text-gray-500 hover:${color}`}>
                  <Image src={icon} alt={label} width={20} height={20} />
                </div>
              ) : (
                <i className={`${icon} text-xl`} />
              )}
              <span className="font-semibold">{label}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Experience Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Experience</h2>
        <ul className="space-y-4">
          {experiences.map((exp, index) => (
            <li
              key={index}
              className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg">
              <span className="font-bold text-lg">{exp.title}</span> -{" "}
              {exp.company} ({exp.date})
              <p className="text-sm text-gray-600 mt-1">
                {exp.description.role}
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                {exp.description.responsibilities.map((responsibility, i) => (
                  <li key={i}>{responsibility}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Website:{" "}
                <a
                  href={exp.website}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer">
                  {exp.websiteText}
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
