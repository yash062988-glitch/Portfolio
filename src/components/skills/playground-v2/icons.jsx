import { SkillIcons as BaseSkillIcons } from "../playground/data";
import React from "react";

// Modern custom vector icon SVGs for tools not present in the original playground
const CustomIcons = {
  Cursor: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" fill="currentColor" />
    </svg>
  ),
  Antigravity: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <circle cx="12" cy="2" r="1.5" fill="currentColor" />
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
    </svg>
  ),
  ChatGPT: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* High fidelity OpenAI-like ChatGPT spinner/flower spiral vector */}
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeDasharray="3 3" />
      <path d="M12 6v12M6 12h12M7.75 7.75l8.5 8.5M7.75 16.25l8.5-8.5" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
  Framer: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      {/* Official Framer logo geometric shape (two squares and a triangle) */}
      <path d="M12 2L5 9h14zm0 14H5l7-7zm0 0l7-7v7z" />
    </svg>
  ),
  NPM: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <text x="50%" y="68%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[12px] font-sans">npm</text>
    </svg>
  ),
  ChatGPTReal: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.74 11.64c.2-.4.24-.86.12-1.29-.12-.44-.39-.8-.74-1.04l-.16-.09c.41-.75.46-1.63.14-2.42-.32-.78-.99-1.34-1.8-1.5l-.17-.03c.1-.84-.2-1.7-.82-2.31-.62-.61-1.48-.9-2.32-.79l-.15.02c-.22-.81-.8-1.45-1.57-1.74-.78-.3-1.66-.21-2.36.26l-.14.1c-.53-.58-1.3-.92-2.11-.92-.81 0-1.58.34-2.11.92l-.14-.1c-.7-.47-1.58-.56-2.36-.26-.77.29-1.35.93-1.57 1.74l-.15-.02c-.84-.11-1.7.18-2.32.79-.62.61-.92 1.47-.82 2.31l-.17.03c-.81.16-1.48.72-1.8 1.5-.32.79-.27 1.67.14 2.42l-.16.09c-.35.24-.62.6-.74 1.04-.12.43-.08.89.12 1.29l.16.09c-.41.75-.46 1.63-.14 2.42.32.78.99 1.34 1.8 1.5l.17.03c-.1.84.2 1.7.82 2.31.62.61 1.48.9 2.32.79l.15-.02c.22.81.8 1.45 1.57 1.74.34.13.7.2 1.06.2.46 0 .9-.11 1.3-.3l.14-.1c.53.58 1.3.92 2.11.92.81 0 1.58-.34 2.11-.92l.14.1c.4.2.84.3 1.3.3.36 0 .72-.07 1.06-.2.77-.29 1.35-.93 1.57-1.74l.15.02c.84.11 1.7-.18 2.32-.79.62-.61.92-1.47.82-2.31l.17-.03c.81-.16 1.48-.72 1.8-1.5.32-.79.27-1.67-.14-2.42l.16-.09zM12 18.06c-3.34 0-6.06-2.72-6.06-6.06S8.66 5.94 12 5.94s6.06 2.72 6.06 6.06-2.72 6.06-6.06 6.06z" />
    </svg>
  )
};

export const SkillIcons = {
  ...BaseSkillIcons,
  ...CustomIcons,
  "Next.js": BaseSkillIcons["Next.js"],
  "Tailwind CSS": BaseSkillIcons["Tailwind CSS"],
  "Framer Motion": BaseSkillIcons["Framer Motion"],
  "Three.js": BaseSkillIcons["Three.js"],
  "React Three Fiber": BaseSkillIcons["React Three Fiber"],
  "Responsive Design": BaseSkillIcons["Responsive Design"],
  "Node.js": BaseSkillIcons["Node.js"],
  "REST API": BaseSkillIcons["REST API"],
  "AI Integration": BaseSkillIcons["AI Integration"],
  "VS Code": BaseSkillIcons["VS Code"],
  ChatGPT: CustomIcons.ChatGPTReal, // use real ChatGPT logo
  npm: CustomIcons.NPM,
  NPM: CustomIcons.NPM
};
