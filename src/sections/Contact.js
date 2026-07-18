"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import SectionHeading from "@/components/design-system/SectionHeading";
import GlassCard from "@/components/design-system/GlassCard";
import SmokyMeshText from "@/components/design-system/SmokyMeshText";
import PrimaryButton from "@/components/design-system/PrimaryButton";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    // Construct direct mailto link to yash062988@gmail.com
    const mailtoUrl = `mailto:yash062988@gmail.com?subject=${encodeURIComponent(formState.subject || "Portfolio Contact Inquiry")}&body=${encodeURIComponent(`Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
      
      // Open the mail client populated with details
      window.location.href = mailtoUrl;
      
      // Reset success state after a few seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <section id="contact" className="relative w-full py-28 md:py-32 bg-transparent overflow-hidden">


      {/* Noise and grid texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid opacity-[0.015] pointer-events-none z-0" />

      {/* Emerging contact astronaut (partially visible, 60-70%, floats and scales on hover) */}
      <motion.div
        animate={shouldReduceMotion ? { y: 0, rotate: 0 } : {
          y: [0, -7, 0],
          rotate: [0, 1.5, -1.5, 0]
        }}
        transition={{
          y: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            type: "spring",
            stiffness: 100,
            damping: 20
          }
        }}
        whileHover={{ scale: 1.04 }}
        className="absolute bottom-[-60px] right-[-50px] md:right-[-90px] w-[240px] h-[240px] md:w-[350px] md:h-[350px] z-0 pointer-events-none select-none"
      >
        <div className="relative w-full h-full overflow-hidden">
          {/* Neutral background halo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] blur-xl pointer-events-none" />
          <Image
            src="/images/contact-astronaut.png"
            alt="Emergent Floating Astronaut"
            fill
            className="object-contain drop-shadow-[0_15px_30px_rgba(20,15,10,0.65)] drop-shadow-[0_30px_60px_rgba(255,255,255,0.05)] filter brightness-95 hover:brightness-100 transition-all duration-500 pointer-events-auto cursor-pointer"
            quality={90}
          />
          {/* Helmet reflection shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
            initial={{ x: "-150%", y: "-150%" }}
            animate={shouldReduceMotion ? { x: "-150%", y: "-150%" } : {
              x: ["150%", "-150%"],
              y: ["150%", "-150%"]
            }}
            transition={{
              duration: 2.0,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 8.0
            }}
            style={{
              mixBlendMode: "screen",
              opacity: shouldReduceMotion ? 0 : 0.18
            }}
          />
        </div>
      </motion.div>

      <div className="relative z-30 w-full max-w-7xl mx-auto px-6">
        
        {/* Standardized Section Header */}
        <SectionHeading
          label="Contact"
          title={
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-none flex flex-wrap gap-x-3">
              <SmokyMeshText text="Get In" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none font-sans" as="span" />
              <SmokyMeshText text="Touch" className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-none font-sans" color="var(--accent-primary)" as="span" />
            </h2>
          }
          description="Let's discuss opportunities, collaborations, or simply connect. Send a message and let's construct something together."
        />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-30">
          
          {/* Left Column: Contact info */}
          <div className="lg:col-span-5 flex flex-col gap-6 pt-2">
            
            {/* Availability Badge */}
            <div className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-400 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Available for Freelance & Roles
            </div>

            {/* Contacts list */}
            <div className="space-y-4">
              <a
                href="mailto:yash062988@gmail.com"
                className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-[#120c08] transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">Email Me</span>
                  <span className="text-white font-medium text-xs md:text-sm">yash062988@gmail.com</span>
                </div>
              </a>

              <a
                href="#call"
                onClick={(e) => {
                  e.preventDefault();
                  setShowContactPopup(true);
                }}
                className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-[#120c08] transition-all duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">Call Me</span>
                  <span className="text-white font-medium text-xs md:text-sm">+91 99714 15954</span>
                </div>
              </a>

              {/* GitHub Bar */}
              <a
                href="https://github.com/yash062988-glitch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-[#120c08] transition-all duration-300">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">GitHub</span>
                  <span className="text-white font-medium text-xs md:text-sm">github.com/yash062988-glitch</span>
                </div>
              </a>

              {/* LinkedIn Bar */}
              <a
                href="https://www.linkedin.com/in/yash-jain-40581736a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-[#120c08] transition-all duration-300">
                  <LinkedinIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">LinkedIn</span>
                  <span className="text-white font-medium text-xs md:text-sm">linkedin.com/in/yash-jain</span>
                </div>
              </a>
            </div>

          </div>

          {/* Right Column: Upgraded Glass Form (with floating labels) */}
          <div className="lg:col-span-7 relative">

            <GlassCard hover={false} className="p-6 md:p-8 bg-white/[0.02] border border-white/10 shadow-2xl relative overflow-hidden z-10">
              
              <h3 className="text-lg font-bold text-white mb-8 tracking-tight">
                Send a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name and Email side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name field */}
                  <div className="relative pt-2">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder=" "
                      value={formState.name}
                      onChange={handleInputChange}
                      onFocus={() => setIsFormFocused(true)}
                      onBlur={() => setIsFormFocused(false)}
                      className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-black/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm"
                    />
                    <label
                      htmlFor="name"
                      className="absolute left-5 top-5.5 text-[10px] font-bold text-white/40 uppercase tracking-wider origin-[0] -translate-y-7 scale-90 transform transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-primary pointer-events-none select-none"
                    >
                      Your Name
                    </label>
                  </div>

                  {/* Email field */}
                  <div className="relative pt-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder=" "
                      value={formState.email}
                      onChange={handleInputChange}
                      onFocus={() => setIsFormFocused(true)}
                      onBlur={() => setIsFormFocused(false)}
                      className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-black/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm"
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-5 top-5.5 text-[10px] font-bold text-white/40 uppercase tracking-wider origin-[0] -translate-y-7 scale-90 transform transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-primary pointer-events-none select-none"
                    >
                      Your Email
                    </label>
                  </div>

                </div>

                {/* Subject field */}
                <div className="relative pt-2">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder=" "
                    value={formState.subject}
                    onChange={handleInputChange}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                    className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-black/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm"
                  />
                  <label
                    htmlFor="subject"
                    className="absolute left-5 top-5.5 text-[10px] font-bold text-white/40 uppercase tracking-wider origin-[0] -translate-y-7 scale-90 transform transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-primary pointer-events-none select-none"
                  >
                    Subject
                  </label>
                </div>

                {/* Message field */}
                <div className="relative pt-2">
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder=" "
                    value={formState.message}
                    onChange={handleInputChange}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                    className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-black/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm resize-none"
                  />
                  <label
                    htmlFor="message"
                    className="absolute left-5 top-5.5 text-[10px] font-bold text-white/40 uppercase tracking-wider origin-[0] -translate-y-7 scale-90 transform transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-primary pointer-events-none select-none"
                  >
                    Message
                  </label>
                </div>

                {/* Submit button utilizing design-system PrimaryButton wrapping */}
                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting || submitted}
                    className="w-full h-12 rounded-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#120c08] border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : submitted ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </PrimaryButton>
                </div>

              </form>

              {/* Status Message Overlay */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 bg-[#120c08]/90 z-20 flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 animate-bounce">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Thank you!</h4>
                    <p className="text-white/60 text-xs max-w-xs font-light leading-relaxed">
                      Your message has been processed. Yash will review it and reply as soon as possible.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </GlassCard>
          </div>

        </div>

      </div>

      {/* Yash Jain Contact Number Popup Modal */}
      <AnimatePresence>
        {showContactPopup && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-sm w-full p-8 rounded-[28px] bg-[#120c08]/95 border border-[#E9B15D]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center flex flex-col items-center z-[95]"
            >
              {/* Close button */}
              <button 
                onClick={() => setShowContactPopup(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors duration-200 p-1 font-bold text-sm cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
              
              <h4 className="text-xl font-bold text-white tracking-wide mt-2">Yash Jain</h4>
              <div className="w-20 h-[1.5px] bg-[#E9B15D] my-4" />
              <p className="text-[#E9B15D] text-lg font-mono tracking-wider font-semibold mb-6 select-all">
                +91 99714 15954
              </p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowContactPopup(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 text-xs font-semibold transition-colors duration-200 cursor-pointer"
                >
                  Close
                </button>
                <a 
                  href="tel:+919971415954"
                  className="flex-1 py-2.5 rounded-xl bg-[#E9B15D] text-[#120c08] text-xs font-bold text-center hover:bg-[#E9B15D]/90 transition-colors duration-200"
                >
                  Call Now
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
