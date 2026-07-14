"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import ChatWindow from "./chat/ChatWindow";

export default function AskAISidebar() {
  const { isSidebarOpen, closeSidebar } = useChat();

  // Handle ESC key press and scroll locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSidebar();
      }
    };
    
    if (isSidebarOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, closeSidebar]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop blurred overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeSidebar}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-over Panel (420px on desktop, 100% on mobile) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative w-full max-w-[420px] h-full bg-[#120c08] border-l border-white/10 flex flex-col justify-between shadow-2xl z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#120c08]/90 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-none">Ask Yash AI</h3>
                  <span className="text-[10px] text-white/50 leading-none block mt-1">Interactive Agent Assistant</span>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body Container */}
            <div className="flex-grow min-h-0 relative">
              <ChatWindow />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
