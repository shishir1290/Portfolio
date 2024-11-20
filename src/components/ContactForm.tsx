import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = { name: "", email: "", subject: "", message: "" };
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.message) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("Sending...");

    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.status === 200) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("Error sending email");
      }
    } catch (error) {
      setStatus("Error sending email");
    }
  };

  return (
    <motion.section
      className="contact overflow-hidden"
      id="contact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full">
        <div className="p-4 md:p-8">
          <motion.h1
            className="text-black text-center pb-8 font-light text-4xl md:text-5xl lg:text-6xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Contact Me
          </motion.h1>
          <form className="flex flex-col items-center" onSubmit={handleSubmit}>
            <div className="md:w-3/4 lg:w-2/3 xl:w-1/2">
              <div className="flex flex-col md:flex-row">
                <motion.input
                  name="name"
                  id="name"
                  type="text"
                  className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full md:w-1/2 md:mr-2 outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out"
                  placeholder="Name"
                  onChange={handleChange}
                  value={formData.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
                {errors.name && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
                <motion.input
                  name="email"
                  id="email"
                  type="email"
                  className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full md:w-1/2 md:ml-2 outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out"
                  placeholder="Email"
                  onChange={handleChange}
                  value={formData.email}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
                {errors.email && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
              <motion.input
                name="subject"
                id="subject"
                type="text"
                placeholder="Subject"
                className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out"
                onChange={handleChange}
                value={formData.subject}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
              {errors.subject && (
                <motion.p
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {errors.subject}
                </motion.p>
              )}
              <motion.textarea
                name="message"
                id="message"
                rows={5}
                placeholder="Say Something"
                onChange={handleChange}
                value={formData.message}
                className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              ></motion.textarea>
              {errors.message && (
                <motion.p
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {errors.message}
                </motion.p>
              )}
            </div>
            <motion.button
              type="submit"
              className="text-md mt-5 rounded-md py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transform hover:scale-105 transition duration-300 ease-in-out"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {status === "Sending..." ? (
                <div className="animate-spin h-6 w-6 border-t-2 border-white rounded-full"></div>
              ) : status === "success" ? (
                <FaCheck className="text-white h-6 w-6" />
              ) : (
                "Send Message"
              )}
            </motion.button>
          </form>
          {status && status !== "Sending..." && (
            <motion.p
              className={`mt-4 text-center font-bold ${
                status.includes("Error") ? "text-red-500" : "text-green-500"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {status.includes("Error") ? status : "Email sent successfully"}
            </motion.p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default ContactForm;
