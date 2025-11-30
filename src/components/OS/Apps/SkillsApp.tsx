/** @format */

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { skills } from "@/components/JSON/skills";

export const SkillsApp: React.FC = () => {
  // Categorize skills
  const frontendSkills = skills.filter((_, index) => index < 8);
  const backendSkills = skills.filter((_, index) => index >= 8 && index < 14);
  const toolsSkills = skills.filter((_, index) => index >= 14);

  const SkillCategory = ({
    title,
    skillsList,
  }: {
    title: string;
    skillsList: typeof skills;
  }) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-orange-500 pb-2">
        {title}
      </h3>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {skillsList.map(({ icon, label, color, isImage }, index) => (
          <motion.li
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 hover:${color} hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}>
            {isImage ? (
              <div className={`text-gray-500 hover:${color}`}>
                <Image src={icon} alt={label} width={24} height={24} />
              </div>
            ) : (
              <i className={`${icon} text-2xl`} />
            )}
            <span className="font-semibold text-gray-700">{label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
        My Skills
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Technologies and tools I work with to build amazing web applications
      </p>

      <SkillCategory title="Frontend Development" skillsList={frontendSkills} />
      <SkillCategory title="Backend Development" skillsList={backendSkills} />
      <SkillCategory title="Tools & Others" skillsList={toolsSkills} />

      {/* Summary */}
      <div className="mt-8 p-6 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Continuous Learning
        </h3>
        <p className="text-gray-700">
          I'm constantly expanding my skill set and staying up-to-date with the
          latest technologies and best practices in web development. My goal is
          to deliver high-quality, performant, and user-friendly applications.
        </p>
      </div>
    </div>
  );
};
