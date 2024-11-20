import { motion } from "framer-motion";
import Image from "next/image";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiences } from "../components/JSON/experiences";
import { skills } from "@/components/JSON/skills";
import { educationHistory } from "@/components/JSON/educationHistory";

export default function About() {
  return (
    <div className="p-4 w-full lg:max-w-7xl lg:mx-auto">
      <motion.div
        className="animate-slide-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* About Me Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
            About Me
          </h1>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              Introduction
            </h2>
            <p className="text-lg text-gray-700">
              I am a passionate web developer with a strong focus on creating
              user-friendly and responsive websites and applications. With a
              dedication to building clean, modern web experiences, I specialize
              in crafting solutions that enhance usability and performance.
            </p>
          </div>

          {/* Technical Expertise Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              Technical Expertise
            </h2>
            <p className="text-lg text-gray-700">
              I have experience working with a variety of front-end and back-end
              technologies, allowing me to create seamless web applications.
              Some of the key technologies I work with include:
            </p>
            <ul className="list-disc pl-5 text-lg text-gray-700">
              <li>HTML, CSS, JavaScript</li>
              <li>React, Next.js, Nest.js</li>
              <li>PHP, .Net</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>

          {/* Design Philosophy Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              Design Philosophy
            </h2>
            <p className="text-lg text-gray-700">
              My design philosophy is rooted in simplicity and accessibility. I
              believe that a well-designed interface should not only be visually
              appealing but also enhance the user experience by being intuitive,
              fast, and easy to navigate.
            </p>
          </div>

          {/* Career Goals Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              Career Goals
            </h2>
            <p className="text-lg text-gray-700">
              My goal is to continue growing as a developer by embracing new
              technologies and challenges. I aim to build impactful projects
              that deliver high performance and positive outcomes, while always
              striving for excellence in everything I do.
            </p>
          </div>

          {/* Closing Remarks Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              Let’s Connect
            </h2>
            <p className="text-lg text-gray-700">
              I am always excited to collaborate on new projects, exchange
              ideas, or discuss potential opportunities. Feel free to reach out,
              and let’s create something amazing together!
            </p>
          </div>
        </section>

        {/* Education Section */}
        <section
          id="education"
          className="relative flex flex-col justify-center items-center py-20 bg-orange-300 text-black"
        >
          {/* Section Header with Animation */}
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-8 text-center bg-clip-text text-black"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Education History
          </motion.h1>

          <div className="md:w-2/3 text-center md:text-left">
            {/* Vertical Timeline with Animation */}
            <VerticalTimeline>
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
                    borderRadius: "10px", // Rounded corners for the content box
                  }}
                  contentArrowStyle={{
                    borderRight:
                      index === 0 ? "9px solid #2d3748" : "7px solid #2d3748",
                  }}
                  // date={edu.duration}
                  iconStyle={{
                    background: edu.iconBg,
                    color: "#000000",
                    fontSize: edu.iconSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #000", // Black border color for the circle
                  }}
                  icon={<span>{edu.iconText}</span>} // Date inside the circle
                >
                  <motion.h3
                    className="text-xl font-semibold"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    {edu.title}
                  </motion.h3>
                  <motion.h1
                    className="text-2xl font-bold"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  >
                    {edu.institution}
                  </motion.h1>
                  <p className="text-lg">{edu.cgpa || edu.gpa}</p>
                  <p className="text-lg">{edu.major || edu.group}</p>
                  <p className="text-lg">{edu.board}</p>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-center">Skills</h2>

          {/* Motion wrapper with animation */}
          <motion.div
            className="animate-slide-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-lg text-gray-700">
              {/* Skill items */}
              {skills.map(({ icon, label, color, isImage }, index) => (
                <motion.li
                  key={index}
                  className={`flex items-center space-x-2 hover:${color} hover:scale-105 transition-all duration-300 ease-in-out`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {isImage ? (
                    <div className={`text-gray-500 hover:${color}`}>
                      <Image src={icon} alt={label} width={20} height={20} />
                    </div>
                  ) : (
                    <i className={`${icon} text-2xl`} />
                  )}
                  <span className="font-semibold">{label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* Experience Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-center">
            Experience
          </h2>
          <motion.div
            className="animate-slide-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <ul className="space-y-4">
              {experiences.map((exp, index) => (
                <motion.li key={index} className="text-lg text-gray-700">
                  <span className="font-bold">{exp.title}</span> - {exp.company}{" "}
                  ({exp.date})
                  <p className="text-sm text-gray-500">{exp.description}</p>
                  <p className="text-sm text-gray-500">
                    Website:{" "}
                    <a
                      href={exp.website}
                      className="text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {exp.websiteText}
                    </a>
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
