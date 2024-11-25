export const projects = [
  {
    title: "A city view",
    description:
      "This project mainly used C++ language for a better solution for design a city view as well this one is user-friendly, and as a result, looking a beautiful city view.",
    image: "cityView.png",
    // link: "https://link-to-project-one.com",
    github: "https://github.com/shishir1290/Designing-A-City-View", // GitHub link
    details: [
      {
        type: "text",
        content:
          "This project primarily uses C++ to design a city view with a focus on providing efficient solutions for urban layouts. The user-friendly interface allows for easy interaction, resulting in a visually appealing city representation.",
      },
      {
        type: "image",
        content: "cityView.png",
        caption: "Screenshot showcasing the designed city view.",
      },
      {
        type: "code",
        content: `
          #include <iostream>
          using namespace std;
    
          void displayCityView() {
              cout << "Welcome to the city view design project!" << endl;
              // Logic for rendering the city view goes here
          }
    
          int main() {
              displayCityView();
              return 0;
          }
        `,
        caption: "Sample C++ code snippet for rendering the city view.",
      },
      {
        type: "code",
        content: `
          // Algorithm for efficient city block arrangement
          vector<vector<int>> optimizeBlocks(vector<vector<int>> &cityGrid) {
              // Logic to optimize the city grid layout
              return cityGrid;
          }
        `,
        caption: "Sample algorithm for optimizing city block arrangements.",
      },
      {
        type: "text",
        content:
          "During this project, challenges included ensuring efficient memory usage in C++ and handling edge cases for irregular city layouts. Solutions were implemented by optimizing algorithms and testing various design iterations.",
      },
      {
        type: "text",
        content:
          "Future improvements could involve integrating advanced 3D rendering for a more immersive user experience and incorporating AI for automated city planning.",
      },
    ],
  },
  {
    title: "AIUB Campus Life",
    description:
      "This Next.js and Tailwind CSS project delivers a streamlined platform showcasing various aspects of university life at AIUB, combining engaging UI/UX elements with robust backend functionalities.",
    image: "aiubCampusLife.png",
    link: "https://aiub-campus-life-iota.vercel.app/",
    github: "https://github.com/shishir1290/aiub-campus-life", // GitHub link
    details: [
      {
        type: "text",
        content:
          "The AIUB Campus Life project provides an engaging interface for students, staff, and visitors to explore university-related information through visually appealing sections and smooth transitions.",
      },
      {
        type: "text",
        content:
          "This application features sections dedicated to academics, events, campus facilities, and alumni networks, ensuring a comprehensive representation of the campus ecosystem.",
      },
      {
        type: "text",
        content:
          "The project integrates animations powered by Framer Motion, enhancing the user experience through dynamic transitions and interactions.",
      },
      {
        type: "image",
        content: "aiubCampusLife.png",
        caption: "Screenshot of the main landing page showcasing campus life.",
      },
      {
        type: "image",
        content: "aiubCampusLife-2.png",
        caption: "Screenshot of the AIUB Clubs.",
      },
      {
        type: "image",
        content: "aiubCampusLife-3.png",
        caption: "Facilities of AIUB.",
      },
      {
        type: "image",
        content: "aiubCampusLife-4.png",
        caption: "Preview of the more clubs.",
      },
      {
        type: "code",
        content: `
          import nodemailer from 'nodemailer';
    
          const sendMail = async () => {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'your-email@gmail.com',
                pass: 'your-password',
              },
            });
    
            const mailOptions = {
              from: 'your-email@gmail.com',
              to: 'receiver-email@gmail.com',
              subject: 'Test Email',
              text: 'Welcome to AIUB Campus Life!',
            };
    
            await transporter.sendMail(mailOptions);
          };
        `,
        caption: "Sample Nodemailer configuration for email functionality.",
      },
      {
        type: "text",
        content:
          "This code demonstrates how the project uses Nodemailer to set up email functionalities, ensuring smooth communication between the platform and its users.",
      },
      {
        type: "text",
        content:
          "Challenges included ensuring responsiveness across multiple devices and optimizing animations for better performance. Solutions involved leveraging Tailwind CSS utilities and minimizing animation-intensive components.",
      },
      {
        type: "code",
        content: `
          import { motion } from 'framer-motion';
    
          const HeroSection = () => {
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="hero-section"
              >
                <h1>Welcome to AIUB Campus Life</h1>
              </motion.div>
            );
          };
    
          export default HeroSection;
        `,
        caption: "Framer Motion example for animating the hero section.",
      },
      {
        type: "text",
        content:
          "This code highlights the use of Framer Motion for animating the hero section, creating smooth fade-in effects for enhanced user experience.",
      },
      {
        type: "text",
        content:
          "This project also includes features such as smooth scrolling navigation using React Scroll and carousels powered by React Responsive Carousel, making the site highly interactive.",
      },
      {
        type: "text",
        content:
          "Future improvements could include integrating AI-based chat systems to assist users and adding an administrative dashboard for better management of campus content.",
      },
      {
        type: "text",
        content:
          "The project’s modular approach using Next.js ensures scalability and ease of maintenance, making it suitable for future expansions, such as integration with external APIs for real-time data.",
      },
    ],
  },
  {
    title: "Gore-Gore E-Commerce Site",
    description:
      "A PHP and MySQL-based e-commerce platform providing basic functionalities like user authentication, product listing, and navigation.",
    image: "ghoreghore.png",
    github: "https://github.com/shishir1290/Gore-Gore-an-ecommerce-site",
    details: [
      {
        type: "text",
        content:
          "The Gore-Gore e-commerce site is a project built using PHP and MySQL, designed to provide essential features for online shopping, such as user authentication and product management.",
      },
      {
        type: "image",
        content: "ghoreghore.png",
        caption:
          "A preview of the homepage layout for the Gore-Gore e-commerce site.",
      },
      {
        type: "code",
        content: `
          <?php
          header('Location: view/homepage.php');
          ?>
        `,
        caption: "Redirect script for navigating to the homepage.",
      },
      {
        type: "text",
        content:
          "The site supports a dynamic product catalog and integrates user-specific functionality to simulate a real-world e-commerce experience.",
      },
      {
        type: "text",
        content:
          "Future improvements could involve integrating payment gateways, optimizing for performance, and adding features like product reviews or AI-based recommendations.",
      },
    ],
  },
  {
    title: "Dot.Net Final Project",
    description:
      "This project utilizes C# and ASP.NET for building a web application that demonstrates core back-end development skills, providing an interactive and responsive user experience.",
    image: "dotnet-project.png",
    github: "https://github.com/shishir1290/Dot.Net_Final_Project", // GitHub link
    details: [
      {
        type: "text",
        content:
          "This project is developed using C# and ASP.NET to create a dynamic web application that handles various backend operations, such as user authentication, data management, and API integration.",
      },
      // {
      //   type: "image",
      //   content: "dotnet-dashboard.jpg",
      //   caption: "Screenshot of the user dashboard showing project functionality.",
      // },
      {
        type: "code",
        content: `
          using System;
          using Microsoft.AspNetCore.Mvc;
  
          public class HomeController : Controller
          {
            public IActionResult Index()
            {
              return View();
            }
          }
        `,
        caption: "Sample C# code for defining a controller in ASP.NET.",
      },
      {
        type: "text",
        content:
          "Challenges in this project included implementing secure authentication and managing data flow efficiently. Solutions included using ASP.NET MVC for clean architecture and secure login systems.",
      },
      {
        type: "text",
        content:
          "Future improvements could include integrating more advanced features like API-based content, user preferences, and optimizing the system for better scalability.",
      },
    ],
  },

  // Add more projects here
];
