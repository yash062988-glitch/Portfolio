import React from "react";

// Dictionary of high-fidelity SVG icons for all technologies
export const SkillIcons = {
  React: (props) => (
    <svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="currentColor" strokeWidth="1" {...props}>
      <circle cx="0" cy="0" r="2.05" fill="currentColor" />
      <g stroke="currentColor">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  "Next.js": (props) => (
    <svg viewBox="0 0 180 180" fill="none" {...props}>
      <mask id="next-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
        <circle cx="90" cy="90" r="90" fill="white" />
      </mask>
      <g mask="url(#next-mask)">
        <circle cx="90" cy="90" r="90" fill="currentColor" className="text-white" />
        <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V75.3347L139.117 170.187C142.846 166.393 146.326 162.148 149.508 157.52Z" fill="black" />
        <path d="M115 54H127V126H115V54Z" fill="black" />
      </g>
    </svg>
  ),
  JavaScript: (props) => (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <rect width="100" height="100" rx="12" fill="#F7DF1E" />
      <path d="M68.5 75.3c0-3.3 1.2-5.7 3.6-7.2s5.8-2.2 10.3-2.2c1.7 0 3.3.1 4.7.4v7.7c-1.3-.3-2.6-.4-4-.4-3.1 0-4.6.9-4.6 2.8 0 1.9 1.9 3 5.7 3.3l5.5.5c4.7.4 7.9 1.6 9.7 3.6s2.7 4.9 2.7 8.8c0 3.8-1.4 6.7-4.1 8.8s-6.7 3.1-11.9 3.1c-2.4 0-4.9-.3-7.5-.9v-8.2c1.9.6 4.1 1 6.5 1 3.5 0 5.2-1 5.2-2.9s-1.8-2.9-5.4-3.2l-5.6-.5c-4.4-.4-7.5-1.6-9.3-3.6s-2.8-4.8-2.8-8.8z" fill="black" transform="scale(0.7) translate(30, 20)" />
    </svg>
  ),
  TypeScript: (props) => (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <rect width="100" height="100" rx="12" fill="#3178C6" />
      <path d="M68.5 75.3c0-3.3 1.2-5.7 3.6-7.2s5.8-2.2 10.3-2.2c1.7 0 3.3.1 4.7.4v7.7c-1.3-.3-2.6-.4-4-.4-3.1 0-4.6.9-4.6 2.8 0 1.9 1.9 3 5.7 3.3l5.5.5c4.7.4 7.9 1.6 9.7 3.6s2.7 4.9 2.7 8.8c0 3.8-1.4 6.7-4.1 8.8s-6.7 3.1-11.9 3.1c-2.4 0-4.9-.3-7.5-.9v-8.2c1.9.6 4.1 1 6.5 1 3.5 0 5.2-1 5.2-2.9s-1.8-2.9-5.4-3.2l-5.6-.5c-4.4-.4-7.5-1.6-9.3-3.6s-2.8-4.8-2.8-8.8zm-41-4.8h38.2V78H53.5v32.5h-11.8V78H27.5v-7.5z" fill="white" transform="scale(0.7) translate(20, 20)" />
    </svg>
  ),
  HTML5: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 2l1.5 17L12 22l6.5-3L20 2z" />
      <path d="M12 5H7.5l.5 5h8l-.5 5-3.5 1.5-3.5-1.5-.2-2" />
    </svg>
  ),
  CSS3: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 2l1.5 17L12 22l6.5-3L20 2z" />
      <path d="M12 5H7.5l.5 5h8l-.5 5-3.5 1.5" />
      <path d="M8.2 12h7.3" />
    </svg>
  ),
  "Tailwind CSS": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 6.5c-2.4 0-4 1.2-4.8 3.6 1.2-1.6 2.8-2 4.8-1.2 1.1.4 2 1.4 2.9 2.4C16.4 12.9 18 14.5 20.8 14.5c2.4 0 4-1.2 4.8-3.6-1.2 1.6-2.8 2-4.8 1.2-1.1-.4-2-1.4-2.9-2.4C16.4 8.1 14.8 6.5 12 6.5z" />
      <path d="M4 14.5C1.6 14.5 0 15.7-.8 18.1c1.2-1.6 2.8-2 4.8-1.2 1.1.4 2 1.4 2.9 2.4.9.9 2.5 2.5 5.3 2.5 2.4 0 4-1.2 4.8-3.6-1.2 1.6-2.8 2-4.8 1.2-1.1-.4-2-1.4-2.9-2.4-.9-.9-2.5-2.5-5.3-2.5z" transform="translate(2, -2)" />
    </svg>
  ),
  "Framer Motion": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M0 0h12v6H0zm12 6h12v6H12zm-12 6h12v6H0zm12 6h12v6H12z" />
    </svg>
  ),
  GSAP: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" />
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[24px] font-sans">G</text>
    </svg>
  ),
  "Three.js": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="12" y1="12" x2="22" y2="8.5" />
      <line x1="12" y1="12" x2="2" y2="8.5" />
    </svg>
  ),
  "React Three Fiber": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="12" y1="12" x2="22" y2="8.5" strokeDasharray="2 2" />
      <line x1="12" y1="12" x2="2" y2="8.5" strokeDasharray="2 2" />
    </svg>
  ),
  "Responsive Design": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Node.js": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Express: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[30px] font-sans">ex</text>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  ),
  Python: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2A10 10 0 0 0 2 12c0 2 .5 3.5 1.5 4.5l1.5-1.5A7.5 7.5 0 0 1 12 4.5c2 0 3.5.5 4.5 1.5L18 4.5A10 10 0 0 0 12 2zm0 20a10 10 0 0 0 10-10c0-2-.5-3.5-1.5-4.5l-1.5 1.5A7.5 7.5 0 0 1 12 19.5c-2 0-3.5-.5-4.5-1.5L6 19.5A10 10 0 0 0 12 22z" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  FastAPI: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
    </svg>
  ),
  MongoDB: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2c0 0-4 4.5-4 9.5C8 16.5 12 22 12 22s4-5.5 4-10.5C16 6.5 12 2 12 2z" />
      <path d="M12 2v20" />
      <path d="M9 11h6" />
    </svg>
  ),
  Firebase: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2l8.5 4.5-8.5 15.5L3.5 6.5 12 2z" />
      <path d="M12 2l4.5 12" />
      <path d="M12 2v20" />
    </svg>
  ),
  Supabase: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.36 11.23l-8.62 10.12a.6.6 0 0 1-1.01-.47v-8.25H4.28a.6.6 0 0 1-.46-1l8.62-10.12a.6.6 0 0 1 1.01.47v8.25h7.45a.6.6 0 0 1 .46 1z" />
    </svg>
  ),
  "REST API": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
      <path d="M18 8h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
  JWT: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  ),
  Authentication: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  SQL: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  "AI Integration": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  ),
  Git: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 15V9a4 4 0 0 0-4-4H9" />
      <path d="M9 15v-6" />
    </svg>
  ),
  GitHub: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  "VS Code": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M2 8l10-6 10 6v8l-10 6-10-6V8z" />
      <path d="M2 8l10 3 10-3" />
      <path d="M12 2v20" />
    </svg>
  ),
  Postman: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
      <path d="M17 5L9.5 12.5 17 20" />
    </svg>
  ),
  Figma: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h3v5h-3A2.5 2.5 0 0 1 5 5.5z" />
      <path d="M5 12.5A2.5 2.5 0 0 1 7.5 10h3v5h-3A2.5 2.5 0 0 1 5 12.5z" />
      <path d="M11.5 3h3a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 14.5 8h-3V3z" />
      <path d="M11.5 10h3a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 14.5 15h-3v-5z" />
      <path d="M5 18.5A2.5 2.5 0 0 1 7.5 16h3v3a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 5 18.5z" />
    </svg>
  ),
  Blender: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 6 15" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Vercel: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L24 22H0L12 2Z" />
    </svg>
  ),
  Netlify: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  NPM: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <text x="50%" y="68%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[12px] font-sans">npm</text>
    </svg>
  ),
  Linux: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <path d="M12 17v4" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  ),
  Photoshop: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <text x="50%" y="68%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[12px] font-sans">Ps</text>
    </svg>
  ),
  Canva: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" />
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[20px] font-sans">C</text>
    </svg>
  ),
  Docker: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12c.3.5 1 1 2.5 1h15c1.5 0 2.2-.5 2.5-1m-20 0c0-1.5 1.5-4 5-4h10c3.5 0 5 2.5 5 4M2 12V9c0-1 1-2 2.5-2h15c1.5 0 2.5 1 2.5 2v3" />
      <rect x="6" y="3" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="9" y="3" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="12" y="3" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="7.5" y="6" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="6" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="13.5" y="6" width="2" height="2" rx="0.5" fill="currentColor" />
    </svg>
  )
};

// Generic Extensible Sections Configuration
export const PLAYGROUND_SECTIONS = [
  {
    id: "frontend",
    title: "FRONTEND",
    skills: [
      { name: "React", label: "Front-End", iconName: "React", weight: 1.0, isCore: true },
      { name: "Next.js", label: "Framework", iconName: "Next.js", weight: 1.1, isCore: true },
      { name: "JavaScript", label: "Language", iconName: "JavaScript", weight: 0.9, isCore: true },
      { name: "TypeScript", label: "Language", iconName: "TypeScript", weight: 1.0, isCore: true },
      { name: "Tailwind CSS", label: "Styling", iconName: "Tailwind CSS", weight: 0.9, isCore: true },
      { name: "HTML5", label: "Markup", iconName: "HTML5", weight: 0.8, isCore: true },
      { name: "CSS3", label: "Styling", iconName: "CSS3", weight: 0.8, isCore: true }
    ]
  },
  {
    id: "backend",
    title: "BACKEND",
    skills: [
      { name: "Node.js", label: "Runtime", iconName: "Node.js", weight: 1.2, isCore: true },
      { name: "Express", label: "Framework", iconName: "Express", weight: 1.0, isCore: true },
      { name: "Python", label: "Language", iconName: "Python", weight: 1.1, isCore: true },
      { name: "FastAPI", label: "Framework", iconName: "FastAPI", weight: 1.0, isCore: true },
      { name: "MongoDB", label: "Database", iconName: "MongoDB", weight: 1.3, isCore: true },
      { name: "MySQL", label: "Database", iconName: "SQL", weight: 1.2, isCore: true }
    ]
  },
  {
    id: "tools",
    title: "TOOLS",
    skills: [
      { name: "Git", label: "VCS", iconName: "Git", weight: 1.0, isCore: true },
      { name: "GitHub", label: "Hosting", iconName: "GitHub", weight: 1.1, isCore: true },
      { name: "Docker", label: "DevOps", iconName: "Docker", weight: 1.3, isCore: true },
      { name: "VS Code", label: "Editor", iconName: "VS Code", weight: 1.0, isCore: true },
      { name: "Figma", label: "Design", iconName: "Figma", weight: 1.1, isCore: true },
      { name: "Postman", label: "API Testing", iconName: "Postman", weight: 0.9, isCore: true }
    ]
  }
];

