import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa"; // Import social media icons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white p-4 lg:p-6 fixed bottom-0 left-0 w-full z-50">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Contact Information */}
        <div className="text-center lg:text-left">
          <p className="text-xs lg:text-base">
            &copy; {new Date().getFullYear()} MD SADMANUR ISLAM SHISHIR. All
            rights reserved.
          </p>
          <p className="text-sm lg:text-base mt-1 flex items-center space-x-4">
            <FaEnvelope />
            <Link
              href="mailto:shishir1290@gmail.com"
              className="text-blue-400 hover:underline"
              passHref
            >
              shishir1290@gmail.com
            </Link>
          </p>
          <p className="text-sm lg:text-base flex items-center space-x-4">
            <FaPhoneAlt />
            <Link
              href="tel:+8801946432534"
              className="text-blue-400 hover:underline"
              passHref
            >
              +8801946432534
            </Link>
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex items-center gap-4 text-lg">
          <Link
            href="https://www.facebook.com/profile.php?id=100011398471238"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500"
          >
            <FaFacebook />
          </Link>
          {/* <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400"
          >
            <FaTwitter />
          </a> */}
          <Link
            href="https://www.linkedin.com/in/shishir1290/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            <FaLinkedin />
          </Link>
          <Link
            href="https://github.com/shishir1290"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaGithub />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
