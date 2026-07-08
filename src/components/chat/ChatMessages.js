"use client";

import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";

export default function ChatMessages({ messages, isTyping }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  return (
    <div ref={containerRef} className="flex-grow p-6 overflow-y-auto space-y-4 min-h-0">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border shrink-0 ${
              msg.role === "user" 
                ? "bg-white/10 border-white/15 text-white" 
                : "bg-primary/10 border-primary/20 text-primary"
            }`}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble Content */}
            <div className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-[#120c08] rounded-br-none font-medium"
                : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none font-light whitespace-pre-line"
            }`}>
              {msg.content}
            </div>

          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex items-end gap-2 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white/5 border border-white/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
