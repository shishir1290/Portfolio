import { useState } from "react";
import { FaCheck } from "react-icons/fa";

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
    <section className="contact" id="contact">
      <div className="w-full">
        <div className="pt-10 md:pt-20">
          <div className="p-4 md:p-8">
            <h1 className="text-white text-center pb-8 font-light text-4xl md:text-5xl lg:text-6xl">
              Contact Me
            </h1>
            <form
              className="flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              <div className="md:w-3/4 lg:w-2/3 xl:w-1/2">
                <div className="flex flex-col md:flex-row">
                  <input
                    name="name"
                    id="name"
                    type="text"
                    className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full md:w-1/2 md:mr-2 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Name"
                    onChange={handleChange}
                    value={formData.name}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                  <input
                    name="email"
                    id="email"
                    type="email"
                    className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full md:w-1/2 md:ml-2 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Email"
                    onChange={handleChange}
                    value={formData.email}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
                <input
                  name="subject"
                  id="subject"
                  type="text"
                  placeholder="Subject"
                  className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-600"
                  onChange={handleChange}
                  value={formData.subject}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm">{errors.subject}</p>
                )}
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  placeholder="Say Something"
                  onChange={handleChange}
                  value={formData.message}
                  className="my-2 py-2 px-4 rounded-md bg-gray-900 text-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm">{errors.message}</p>
                )}
              </div>
              <button
                type="submit"
                className="border-2 text-md mt-5 rounded-md py-2 px-4 bg-blue-600 hover:bg-blue-700 text-gray-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {status === "Sending..." ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
                ) : status === "success" ? (
                  <FaCheck className="text-white h-5 w-5" />
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
            {status && status !== "Sending..." && (
              <p
                className={`mt-4 text-center font-bold ${
                  status.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
              >
                {status.includes("Error") ? status : "Email sent successfully"}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
