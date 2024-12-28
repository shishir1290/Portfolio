import {
  FaHome,
  FaInfoCircle,
  FaProjectDiagram,
  FaEnvelope,
  FaBlog,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>(router.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleLinkClick = (section: string) => {
    setActiveSection(section);
    setIsSidebarOpen(false); // Close sidebar on link click (for mobile)
  };

  useEffect(() => {
    const rout = router.pathname;

    if (rout.startsWith("/blog/")) {
      const pathSegments = rout.split("/");
      if (pathSegments.length > 2) {
        setActiveSection("/blog");
      }
    } else {
      setActiveSection(rout);
    }
  }, [router.pathname]);

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Sidebar Toggle for Small Screens */}
      <button
        className="lg:hidden p-4 bg-[#81BFDA] text-white fixed z-50 flex items-center justify-center transition-transform duration-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        <span
          className={`transform transition-transform duration-300 ${
            isSidebarOpen ? "rotate-90" : ""
          }`}
        >
          {isSidebarOpen ? "✕" : "☰"}
        </span>
      </button>

      <div className={`lg:hidden`}>
        <Navbar />
      </div>

      {/* Sidebar */}
      <nav
        className={`fixed lg:relative z-40 bg-orange-400 text-white w-40 lg:w-1/6 h-full transform ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full transition-all transform bg-opacity-0 hover:bg-opacity-100 hover:translate-x-0"
        } lg:translate-x-0 transition-transform`}
      >
        <div className="p-5">
          <h1 className={`text-2xl font-bold mb-8 text-black hidden lg:block`}>
            My Portfolio
          </h1>
          <ul className="mt-8 lg:mt-0 space-y-6">
            {[
              { href: "/", icon: FaHome, label: "Home" },
              { href: "/about", icon: FaInfoCircle, label: "About" },
              { href: "/projects", icon: FaProjectDiagram, label: "Projects" },
              { href: "/blog", icon: FaBlog, label: "Blog" },
              { href: "/contact", icon: FaEnvelope, label: "Contact" },
            ].map(({ href, icon, label }) => (
              <NavItem
                key={href}
                href={href}
                icon={icon}
                label={label}
                active={activeSection === href}
                onClick={() => handleLinkClick(href)}
              />
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <div id="home">{children}</div>
      </main>

      <Footer />
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavItem({ href, icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <li className={`relative group ${active ? "text-cyan-400" : "text-black"}`}>
      <Link
        href={href}
        className={`block text-lg flex items-center space-x-4 py-2 ${
          active ? "text-cyan-200" : "text-white"
        }`}
        onClick={onClick}
      >
        <Icon
          className={`text-3xl ${active ? "text-cyan-500" : "text-black"}`}
        />
        <span
          className={`absolute left-8 lg:left-16 text-sm ${
            active ? "text-cyan-200 font-bold" : "text-black"
          } opacity-100 lg:transition-all lg:transform lg:translate-x-[-20px] lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-x-0`}
        >
          {label}
        </span>
        <div
          className={`absolute bottom-0 left-0 w-0 h-1 ${
            active ? "bg-cyan-200" : "bg-black"
          } transition-all group-hover:w-full`}
        />
      </Link>
    </li>
  );
}
