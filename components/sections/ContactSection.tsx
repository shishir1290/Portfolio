"use client";

import { useEffect, useRef, useState } from "react";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const contactItems = [
    {
      label: "Email",
      value: "shishir1290@gmail.com",
      href: "mailto:shishir1290@gmail.com",
      icon: (
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      ),
    },
    {
      label: "Phone",
      value: "+880 1946-432534",
      href: "tel:+8801946432534",
      icon: (
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      ),
    },
    {
      label: "Alt Email",
      value: "shishir1290@gmail.com",
      href: "mailto:shishir1290@gmail.com",
      icon: (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      ),
    },
    {
      label: "Location",
      value: "Mirpur 11, Dhaka, Bangladesh",
      href: "https://maps.google.com/?q=Mirpur+11,+Dhaka",
      icon: (
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      ),
    },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      <div
        className="absolute inset-0 grid-bg opacity-30 pointer-events-none"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,245,212,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          className={`mb-20 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p
            className="text-primary text-xs tracking-[0.4em] mb-3"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            05 / CONTACT
          </p>
          <h2
            className="text-5xl lg:text-7xl font-bold mb-4"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            <span className="text-white">LET&apos;S </span>
            <span className="gradient-text">CONNECT</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
            I&apos;m currently open to new opportunities and collaborations.
            Whether you have a project in mind or just want to chat — my inbox
            is always open.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div
            className={`lg:col-span-2 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <div className="space-y-4 mb-10">
              {contactItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 glass-card p-4 rounded-sm group"
                >
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-primary/20"
                    style={{ backgroundColor: "rgba(0,245,212,0.08)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-primary"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs text-white/30 tracking-wider mb-0.5"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      {item.label.toUpperCase()}
                    </p>
                    <p className="text-white/70 text-sm truncate group-hover:text-primary transition-colors">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Reference */}
            <div className="glass-card p-6 rounded-sm">
              <p
                className="text-xs text-white/30 tracking-wider mb-4"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                REFERENCE
              </p>
              <div>
                <p className="text-white/80 font-semibold">Md Anik Islam</p>
                <p className="text-primary/70 text-xs mt-1" style={{ fontFamily: "Space Mono, monospace" }}>
                  Deputy Manager, Pakiza Software Limited
                </p>
                <p className="text-white/30 text-xs mt-2">
                  anik.ba@pakizasoftware.com
                </p>
                <p className="text-white/30 text-xs">+880 1687-893691</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className={`lg:col-span-3 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            {submitted ? (
              <div className="glass-card p-12 rounded-sm flex flex-col items-center justify-center text-center h-full">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: "rgba(0,245,212,0.1)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "Bebas Neue, sans-serif" }}
                >
                  MESSAGE SENT SUCCESSFULLY
                </h3>
                <p className="text-white/40 text-sm">
                  Thank you for reaching out! I&apos;ll get back to
                  you as soon as possible.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                  className="mt-6 btn-primary"
                >
                  <span>SEND ANOTHER</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass-card p-8 rounded-sm space-y-5"
              >
                {/* Error message */}
                {error && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-sm text-sm"
                    style={{
                      backgroundColor: "rgba(247, 37, 133, 0.08)",
                      border: "1px solid rgba(247, 37, 133, 0.3)",
                      color: "#f72585",
                      fontFamily: "Space Mono, monospace",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { key: "name", label: "Your Name", type: "text", placeholder: "Md Rahman" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label
                        className="block text-xs text-white/30 tracking-wider mb-2"
                        style={{ fontFamily: "Space Mono, monospace" }}
                      >
                        {field.label.toUpperCase()}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        required
                        disabled={sending}
                        value={formState[field.key as keyof typeof formState]}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "Space Mono, monospace" }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    className="block text-xs text-white/30 tracking-wider mb-2"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    placeholder="Project Inquiry / Job Opportunity"
                    value={formState.subject}
                    required
                    disabled={sending}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs text-white/30 tracking-wider mb-2"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    MESSAGE
                  </label>
                  <textarea
                    placeholder="Tell me about your project or opportunity..."
                    required
                    disabled={sending}
                    rows={5}
                    value={formState.message}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {sending ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        SENDING...
                      </>
                    ) : (
                      "SEND MESSAGE"
                    )}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
