"use client";

import { useState, useTransition } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestedPrompts from "./SuggestedPrompts";
import { CHATBOT_PROMPTS, CHATBOT_RESPONSES } from "@/constants/data";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: CHATBOT_RESPONSES.default }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();

  const triggerAIResponse = (userQuery) => {
    setIsTyping(true);

    setTimeout(() => {
      startTransition(() => {
        const queryClean = userQuery.trim();
        let responseText = CHATBOT_RESPONSES.default;

        const matchingKey = Object.keys(CHATBOT_RESPONSES).find(
          key => key.toLowerCase() === queryClean.toLowerCase()
        );

        if (matchingKey) {
          responseText = CHATBOT_RESPONSES[matchingKey];
        } else if (queryClean.toLowerCase().includes("resume")) {
          responseText = CHATBOT_RESPONSES["Download your resume"];
        } else if (queryClean.toLowerCase().includes("skill") || queryClean.toLowerCase().includes("stack")) {
          responseText = CHATBOT_RESPONSES["Know your skills"];
        } else if (queryClean.toLowerCase().includes("project") || queryClean.toLowerCase().includes("work")) {
          responseText = CHATBOT_RESPONSES["What projects have you built?"];
        } else if (queryClean.toLowerCase().includes("about") || queryClean.toLowerCase().includes("who")) {
          responseText = CHATBOT_RESPONSES["Tell me about yourself"];
        } else {
          responseText = "I'm a static assistant, but I know a lot about Yash! Ask me about his 'skills', 'projects', 'resume', or click one of the suggested prompts above.";
        }

        setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
        setIsTyping(false);
      });
    }, 1200);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const userMessage = inputVal;
    setInputVal("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    triggerAIResponse(userMessage);
  };

  const handlePromptClick = (prompt) => {
    if (isTyping) return;
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    triggerAIResponse(prompt);
  };

  return (
    <div className="flex flex-col h-full justify-between min-h-0 bg-[#120c08]/95">
      {/* Session Details Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01] shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-white/80">Interactive Session</span>
        </div>
        <button
          onClick={() => setMessages([{ role: "assistant", content: CHATBOT_RESPONSES.default }])}
          className="text-[10px] text-white/40 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          Clear History
        </button>
      </div>

      {/* Messages Bubbles list */}
      <ChatMessages messages={messages} isTyping={isTyping} />

      {/* Bottom suggested tags panel */}
      <div className="px-6 py-4 border-t border-white/5 bg-[#120c08]/40 shrink-0">
        <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider block mb-3">Suggested Prompts</span>
        <SuggestedPrompts prompts={CHATBOT_PROMPTS} onPromptClick={handlePromptClick} disabled={isTyping} />
      </div>

      {/* Chat submit input field form */}
      <ChatInput inputVal={inputVal} setInputVal={setInputVal} onSend={handleSend} disabled={isTyping} className="shrink-0" />
    </div>
  );
}
