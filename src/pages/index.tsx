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
            <Link
              href="/contact"
              className="inline-block bg-orange-500 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-600 transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Contact Me
            </Link>

            {/* Resume Button */}
            <Link
              href="/image/CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-cyan-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-cyan-700 transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <FaFileAlt className="inline mr-2 text-xl" />
              View My Resume
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
