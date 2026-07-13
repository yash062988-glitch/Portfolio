"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import SectionHeading from "@/components/design-system/SectionHeading";
import GlassCard from "@/components/design-system/GlassCard";
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
  const shouldReduceMotion = useReducedMotion();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
      
      // Reset success state after a few seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="relative w-full py-28 md:py-32 bg-transparent overflow-hidden">
      {/* Background radial spotlights */}
      <div className="absolute bottom-0 left-[15%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.12)_0%,transparent_75%)] blur-[95px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[10%] w-[45%] h-[45%] rounded-full bg-[radial-gradient(circle,rgba(255,221,168,0.06)_0%,transparent_70%)] blur-[90px] pointer-events-none z-0" />

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
        className="absolute bottom-[-60px] right-[-50px] md:right-[-90px] w-[240px] h-[240px] md:w-[350px] md:h-[350px] z-10 pointer-events-auto select-none"
      >
        <div className="relative w-full h-full overflow-hidden">
          {/* Warm background halo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(233,177,93,0.12)_0%,transparent_70%)] blur-xl pointer-events-none" />
          <Image
            src="/images/contact-astronaut.png"
            alt="Emergent Floating Astronaut"
            fill
            className="object-contain drop-shadow-[0_15px_30px_rgba(20,15,10,0.65)] drop-shadow-[0_30px_60px_rgba(233,177,93,0.15)] filter brightness-95 hover:brightness-100 transition-all duration-500"
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        
        {/* Standardized Section Header */}
        <SectionHeading
          label="Contact"
          title="Get In Touch"
          description="Let's discuss opportunities, collaborations, or simply connect. Send a message and let's construct something together."
        />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-20">
          
          {/* Left Column: Contact info */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-400 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Available for Freelance & Roles
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Contact Details
              </h3>
              <p className="text-white/60 text-xs leading-relaxed font-light">
                Feel free to email me, call me, or reach out through my professional networks. I'll get back to you within 24 hours.
              </p>
            </div>

            {/* Contacts list */}
            <div className="space-y-4 pt-2">
              <a
                href="mailto:contact@yashjain.com"
                className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-[#120c08] transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">Email Me</span>
                  <span className="text-white font-medium text-xs md:text-sm">contact@yashjain.com</span>
                </div>
              </a>

              <a
                href="tel:+919876543210"
                className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-[#120c08] transition-all duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">Call Me</span>
                  <span className="text-white font-medium text-xs md:text-sm">+91 98765 43210</span>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-[20px] border border-white/5 bg-white/[0.02]">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">Location</span>
                  <span className="text-white font-medium text-xs md:text-sm">India, IST timezone</span>
                </div>
              </div>
            </div>

            {/* Social profiles */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-primary hover:text-[#120c08] hover:border-primary transition-all duration-300"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-primary hover:text-[#120c08] hover:border-primary transition-all duration-300"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Right Column: Upgraded Glass Form (with floating labels) */}
          <div className="lg:col-span-7 relative">
            {/* Soft radial glow behind the form card, transition opacity on input focus */}
            <div
              className="absolute -inset-10 pointer-events-none z-0 rounded-full transition-opacity duration-300 ease-out"
              style={{
                background: "radial-gradient(circle, rgba(245,201,122,0.14), transparent 70%)",
                opacity: isFormFocused ? 1.0 : 0.57
              }}
            />
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
                      className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-[#0b0705]/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm"
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
                      className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-[#0b0705]/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm"
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
                    className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-[#0b0705]/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm"
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
                    className="peer w-full px-5 py-3.5 rounded-xl border border-white/10 bg-[#0b0705]/80 text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-xs md:text-sm resize-none"
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
    </section>
  );
}
