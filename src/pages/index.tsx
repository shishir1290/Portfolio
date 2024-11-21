import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaFileAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [movingImage, setMovingImage] = useState(false);

  return (
    <div className="p-4 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between space-y-12 lg:space-y-0 lg:space-x-12">
        {/* Left Side Content */}
        <div className="text-center lg:text-left mb-8 max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-orange-500 mb-4 animate__animated animate__fadeIn animate__delay-1s">
            Welcome to My Portfolio
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 animate__animated animate__fadeIn animate__delay-2s">
            I'm MD SADMANUR ISLAM SHISHIR
          </h2>

          {/* Right Side Image (in mobile view, image will be under the name) */}
          <div className="relative w-52 block lg:hidden  animate__animated animate__fadeIn animate__delay-7s mx-auto lg:mx-0">
            <motion.img
              animate={{
                y: [0, -40, 0], // Moves up, then back to original position
              }}
              transition={{
                duration: 2, // Time for one complete cycle
                repeat: Infinity, // Loop infinitely
                ease: "easeInOut", // Smooth animation
              }}
              src="/image/shishir.png"
              alt="Profile Picture"
              className="rounded-full w-full shadow-xl transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl drop-shadow-md hover:drop-shadow-xl"
            />
          </div>

          {/* Introduction Paragraph */}
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 animate__animated animate__fadeIn animate__delay-3s">
            I am a web developer with a passion for building user-friendly
            websites and applications. I specialize in crafting clean,
            responsive, and modern web experiences. I have experience working
            with a variety of technologies including:
          </p>

          {/* Skills List */}
          <ul className="list-disc pl-6 text-lg sm:text-xl text-gray-700 mb-8 animate__animated animate__fadeIn animate__fast animate__delay-4s text-left">
            <li>HTML, CSS, JavaScript</li>
            <li>React, Next.js, Nest.js</li>
            <li>PHP, .Net</li>
            <li>Tailwind CSS</li>
          </ul>

          {/* CTA Buttons */}
          <div className="text-center lg:text-left space-y-4 space-x-2 animate__animated animate__fadeIn animate__delay-5s">
            {/* Contact Me Button */}
            <Link href="/contact" className="inline-block py-3">
              <button className="group relative outline-0 bg-sky-200 [--sz-btn:48px] [--space:calc(var(--sz-btn)/5.5)] [--gen-sz:calc(var(--space)*2)] [--sz-text:calc(var(--sz-btn)-var(--gen-sz))] h-12 w-auto min-w-[150px] max-w-[300px] border border-solid border-transparent rounded-xl flex items-center justify-center aspect-square cursor-pointer transition-transform duration-200 active:scale-[0.95] bg-[linear-gradient(45deg,#2196f3,#4caf50)] [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]">
                <svg
                  className="animate-pulse absolute z-10 overflow-visible transition-all duration-300 text-[#ffea50] group-hover:text-white top-[calc(var(--sz-text)/7)] left-[calc(var(--sz-text)/7)] h-[var(--gen-sz)] w-[var(--gen-sz)] group-hover:h-[var(--sz-text)] group-hover:w-[var(--sz-text)] group-hover:left-[calc(var(--sz-text)/4)] group-hover:top-[calc(calc(var(--gen-sz))/2)]"
                  stroke="none"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                  ></path>
                </svg>
                <span className="font-normal text-white text-lg leading-none transition-all duration-200 group-hover:opacity-0">
                  Contact Me
                </span>
              </button>
            </Link>

            {/* Resume Button */}
            <Link
              href="/image/CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block  py-3 px-6"
              role="button"
              title="Resume"
            >
              <button className="relative flex items-center px-6 py-3 overflow-hidden font-medium transition-all bg-indigo-500 rounded-md group">
                <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-mr-4 group-hover:-mt-4">
                  <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                </span>
                <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-ml-4 group-hover:-mb-4">
                  <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                </span>
                <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-indigo-600 rounded-md group-hover:translate-x-0"></span>
                <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">
                  <FaFileAlt className="inline mr-2 text-xl" /> View My Resume
                </span>
              </button>
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center lg:justify-start space-x-6 mt-6 animate__animated animate__fadeIn animate__delay-6s">
            {/* Facebook Link */}
            <Link
              href="https://www.facebook.com/profile.php?id=100011398471238"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-800 hover:text-blue-800 transition duration-300 ease-in-out transform hover:scale-110"
            >
              <FaFacebook />
            </Link>

            {/* LinkedIn Link */}
            <Link
              href="https://www.linkedin.com/in/shishir1290/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-800 hover:text-blue-900 transition duration-300 ease-in-out transform hover:scale-110"
            >
              <FaLinkedin />
            </Link>

            {/* GitHub Link */}
            <Link
              href="https://github.com/shishir1290"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-800 hover:text-black transition duration-300 ease-in-out transform hover:scale-110"
            >
              <FaGithub />
            </Link>
          </div>
        </div>

        {/* Right Side Image (on desktop mode, image stays to the right) */}
        <div className="relative hidden lg:block w-72 sm:w-80 md:w-96 lg:w-1/2 animate__animated animate__fadeIn animate__delay-7s mx-auto lg:mx-0">
          <motion.img
            animate={{
              y: [0, -40, 0], // Moves up, then back to original position
            }}
            transition={{
              duration: 2, // Time for one complete cycle
              repeat: Infinity, // Loop infinitely
              ease: "easeInOut", // Smooth animation
            }}
            src="/image/shishir.png"
            alt="Profile Picture"
            className="rounded-full w-full shadow-xl transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl drop-shadow-md hover:drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
