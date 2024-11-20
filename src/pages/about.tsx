import { motion } from "framer-motion";
import Image from "next/image";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

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
              {/* First Timeline Item - Bachelors */}
              <VerticalTimelineElement
                className="vertical-timeline-element--school"
                contentStyle={{
                  background: "#2d3748", // Dark background color
                  color: "#fff",
                  borderRadius: "10px", // Rounded corners for the content box
                }}
                contentArrowStyle={{
                  borderRight: "9px solid  #2d3748", // Arrow color to match the background
                }}
                date=""
                iconStyle={{
                  background: "#fbbf24", // Golden icon color
                  color: "#000000",
                  fontSize: "0.6rem", // Font size for date inside the circle
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #000", // Black border color for the circle
                }}
                icon={<span>{"2020 - 2024"}</span>} // Date inside the circle
              >
                <motion.h3
                  className="text-xl font-semibold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  Bachelor of Computer Science and Engineering
                </motion.h3>
                <motion.h1
                  className="text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  American International University-Bangladesh (AIUB)
                </motion.h1>
                <p className="text-lg">CGPA: 3.60</p>
                <p className="text-lg">Major: Software Engineering</p>
              </VerticalTimelineElement>

              {/* Second Timeline Item - HSC */}
              <VerticalTimelineElement
                className="vertical-timeline-element--work"
                contentStyle={{
                  background: "#2d3748", // Dark background color
                  color: "#fff",
                  borderRadius: "10px", // Rounded corners for the content box
                }}
                contentArrowStyle={{
                  borderRight: "7px solid  #2d3748", // Arrow color to match the background
                }}
                date=""
                iconStyle={{
                  background: "#4caf50", // Green icon color
                  color: "#000000",
                  fontSize: "0.6rem", // Font size for date inside the circle
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #000", // Black border color for the circle
                }}
                icon={<span>{"2017 - 2019"}</span>} // Date inside the circle
              >
                <motion.h3
                  className="text-xl font-semibold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  Higher Secondary Certificate (HSC)
                </motion.h3>
                <motion.h1
                  className="text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  Milestone College, Uttara
                </motion.h1>
                <p className="text-lg">GPA: 5.00</p>
                <p className="text-lg">Group: Science</p>
                <p className="text-lg">Board: Dhaka</p>
              </VerticalTimelineElement>

              {/* Third Timeline Item - SSC */}
              <VerticalTimelineElement
                className="vertical-timeline-element--work"
                contentStyle={{
                  background: "#2d3748", // Dark background color
                  color: "#fff",
                  borderRadius: "10px", // Rounded corners for the content box
                }}
                contentArrowStyle={{
                  borderRight: " solid  #2d3748", // Arrow color to match the background
                }}
                date=""
                iconStyle={{
                  background: "#e53e3e", // Red icon color
                  color: "#000000",
                  fontSize: "0.6rem", // Font size for date inside the circle
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #000", // Black border color for the circle
                }}
                icon={<span>{"2015 - 2017"}</span>} // Date inside the circle
              >
                <motion.h3
                  className="text-xl font-semibold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  Secondary School Certificate (SSC)
                </motion.h3>
                <motion.h1
                  className="text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  Sristy Academic School, Tangail
                </motion.h1>
                <p className="text-lg">GPA: 5.00</p>
                <p className="text-lg">Group: Science</p>
                <p className="text-lg">Board: Dhaka</p>
              </VerticalTimelineElement>
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
              {/* Skill Item for HTML */}
              <motion.li
                className="flex items-center space-x-2 hover:text-blue-500 hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fab fa-html5 text-2xl"></i>
                <span className="font-semibold">HTML</span>
              </motion.li>

              {/* Skill Item for CSS */}
              <motion.li
                className="flex items-center space-x-2 hover:text-blue-500 hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fab fa-css3-alt text-2xl"></i>
                <span className="font-semibold">CSS</span>
              </motion.li>

              {/* Skill Item for JavaScript */}
              <motion.li
                className="flex items-center space-x-2 hover:text-yellow-500 hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fab fa-js-square text-2xl"></i>
                <span className="font-semibold">JavaScript</span>
              </motion.li>

              {/* Skill Item for React */}
              <motion.li
                className="flex items-center space-x-2 hover:text-blue-400 hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fab fa-react text-2xl"></i>
                <span className="font-semibold">React</span>
              </motion.li>

              {/* Skill Item for Node.js */}
              <motion.li
                className="flex items-center space-x-2 hover:text-black hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fab fa-node text-2xl"></i>
                <span className="font-semibold">Node.js</span>
              </motion.li>

              {/* Skill Item for Next.js (using custom icon or placeholder) */}
              <motion.li
                className="flex items-center space-x-2 hover:text-black hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Custom Next.js Icon - replace with actual SVG or image */}
                <Image
                  src="/image/nextjs.svg"
                  alt="Next.js"
                  width={20}
                  height={20}
                />
                <span className="font-semibold">Next.js</span>
              </motion.li>

              {/* Skill Item for Tailwind CSS */}
              <motion.li
                className="flex items-center space-x-2 hover:text-pink-400 hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fas fa-cogs text-2xl"></i>
                <span className="font-semibold">Tailwind CSS</span>
              </motion.li>

              {/* Skill Item for Git */}
              <motion.li
                className="flex items-center space-x-2 hover:text-black hover:scale-105 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fab fa-git-alt text-2xl"></i>
                <span className="font-semibold">Git</span>
              </motion.li>
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
              <motion.li className="text-lg text-gray-700">
                <span className="font-bold">Front-End Developer Intern</span> -
                Example Tech Company (2023)
                <p className="text-sm text-gray-500">
                  Contributed to the development of user interfaces using React
                  and Tailwind CSS. Worked closely with the design team to
                  implement responsive designs.
                </p>
              </motion.li>
              <motion.li className="text-lg text-gray-700">
                <span className="font-bold">Freelance Web Developer</span> (2022
                - Present)
                <p className="text-sm text-gray-500">
                  Built custom websites and web applications for various clients
                  using HTML, CSS, JavaScript, and React. Focused on creating
                  clean, responsive, and accessible web experiences.
                </p>
              </motion.li>
            </ul>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
