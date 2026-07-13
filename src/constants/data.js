export const BENTO_DATA = {
  about: {
    title: "About Me",
    content: "I'm a developer, AI enthusiast, and creative problem solver. I combine technical engineering with user-centric design to build intelligent digital experiences that address real-world challenges.",
  },
  education: [
    {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "Specializing in AI & Machine Learning",
      status: "Ongoing / Graduate",
    }
  ],
  experience: [
    {
      role: "Frontend Engineer & AI Developer",
      company: "Independent / Freelance Projects",
      duration: "2024 - Present",
      description: "Building responsive next-gen web applications integrated with deep learning and AI APIs."
    }
  ],
  location: {
    city: "India",
    timezone: "IST (UTC+5:30)",
  },
  languages: [
    { name: "English", level: "Professional" },
    { name: "Hindi", level: "Native" }
  ],
  interests: [
    "Artificial Intelligence",
    "Generative AI & LLMs",
    "Photography & Graphic Design",
    "Product Design & UI/UX",
    "Human-Computer Interaction"
  ],
  whatDrivesMe: "I am driven by the intersection of engineering and design. Technology should not just be powerful; it should be intuitive, accessible, and delightful to interact with.",
  funFact: "When I'm not debugging or tweaking UI spacing, you'll find me exploring abstract digital artwork, experimenting with generative models, or learning about astrophysics."
};

export const SKILLS_DATA = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frameworks" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "HTML & CSS", category: "Frontend" },
  { name: "JavaScript", category: "Programming Languages" },
  { name: "Node.js", category: "Backend" },
  { name: "MongoDB", category: "Backend" },
  { name: "SQL", category: "Backend" },
  { name: "Python", category: "Programming Languages" },
  { name: "Java", category: "Programming Languages" },
  { name: "Artificial Intelligence", category: "AI" },
  { name: "Machine Learning", category: "Machine Learning" },
  { name: "Data Analysis", category: "Data Analytics" },
  { name: "Statistics", category: "Data Analytics" },
  { name: "Figma", category: "Design" },
  { name: "Canva", category: "Design" },
  { name: "Git & GitHub", category: "Tools" },
  { name: "VS Code", category: "Tools" }
];

export const PROJECTS_DATA = [
  {
    id: "soundwave-ai",
    title: "SoundWave AI",
    category: "AI Music Platform",
    shortDesc: "An intelligent ad-free music streaming platform that recommends songs based on user taste while giving independent artists greater visibility through AI discovery.",
    desc: "SoundWave AI is a cinematic music streaming experience designed to bridge the gap between popular hits and independent talent. Powered by local preference modeling, it designs a custom discovery board for every listener.",
    problem: "Independent musicians struggle to gain visibility on mainstream streaming platforms, which are dominated by algorithmic biases favoring established artists and major labels.",
    solution: "We built a decentralized recommendation model that dynamically spotlights independent tracks alongside mainstream releases, creating a balanced and personalized music discovery engine.",
    challenges: "Optimizing audio streaming latency and running client-side recommendation matrix operations smoothly without blocking the UI main thread.",
    tech: ["React", "Tailwind CSS", "Framer Motion", "Vercel"],
    github: "https://github.com/ka0-0/Soundwave_AI",
    demo: "https://soundwave-ai-ioik.vercel.app",
    image: "/images/hero-bg.png",
    accentColor: "rgba(168, 85, 247, 0.2)", // Purple accent glow
    hoverBorderColor: "rgba(168, 85, 247, 0.6)"
  },
  {
    id: "domiq-ai",
    title: "DOMIQ AI",
    category: "AI Interior Design",
    shortDesc: "An immersive AI-powered 3D home visualization platform that helps users design, explore, and enhance interiors with realistic previews.",
    desc: "DOMIQ AI brings luxury interior design directly to the browser. By leveraging web-native 3D graphics and model processing, it allows clients to experiment with ambient lights, fabrics, and furniture configurations dynamically.",
    problem: "Homeowners and interior designers struggle to visualize how furniture, paint colors, and lighting will look in a physical space before making expensive purchasing decisions.",
    solution: "An interactive web portal that dynamically loads materials, models, and custom lighting based on simple text descriptions or design presets.",
    challenges: "Achieving fast load times for highly detailed 3D assets on mobile devices while maintaining realistic ambient lighting shaders.",
    tech: ["React", "Tailwind CSS", "Framer Motion", "Vercel"],
    github: "https://github.com/Jitarth-web/DOMIQ-AI",
    demo: "https://domiq-ai-seven.vercel.app",
    image: "/images/hero-bg.png",
    accentColor: "rgba(233, 177, 93, 0.25)", // Warm architectural gold glow
    hoverBorderColor: "rgba(233, 177, 93, 0.65)"
  },
  {
    id: "shagun-fashion",
    title: "Shagun Fashion Uniforms",
    category: "Business Website",
    shortDesc: "A premium manufacturing website for a school uniform factory outlet featuring elegant typography, responsive layouts, and product showcases.",
    desc: "Shagun Fashion is a modern digital showroom built for a major school uniform manufacturer. It features detailed textile showcases, customized sizing matrices, and direct quote workflows for institutions.",
    problem: "A retail manufacturer of custom uniforms lacked a modern online catalog, limiting customer interaction, custom order placements, and brand representation in the local market.",
    solution: "A high-performance business platform built to showcase products in an elegant showroom fashion, complete with responsive fabric catalogs and a direct inquiry pipeline.",
    challenges: "Optimizing heavy fabric close-up asset images for slow networks while preserving micro-details and texture sharpness.",
    tech: ["React", "Tailwind CSS", "Framer Motion", "Vercel"],
    github: "https://github.com/yash062988-glitch/shagun_fashion",
    demo: "https://shagun-fashion.vercel.app",
    image: "/images/hero-bg.png",
    accentColor: "rgba(59, 130, 246, 0.2)", // Premium navy glow
    hoverBorderColor: "rgba(233, 177, 93, 0.5)" // Gold border
  },
  {
    id: "placeholder-card",
    title: "Your Project Here",
    category: "Placeholder",
    shortDesc: "Your next idea deserves a place in this portfolio. This slot is reserved for the next mission waiting to be built.",
    desc: "This slot is reserved for the next mission waiting to be built.",
    problem: "This slot is reserved for the next mission waiting to be built.",
    solution: "This slot is reserved for the next mission waiting to be built.",
    challenges: "This slot is reserved for the next mission waiting to be built.",
    tech: [],
    github: "",
    demo: "",
    image: "/images/hero-bg.png",
    isPlaceholder: true,
    accentColor: "rgba(233, 177, 93, 0.15)", // Neutral gold glow
    hoverBorderColor: "rgba(233, 177, 93, 0.45)"
  }
];

export const CERTIFICATIONS_DATA = [
  {
    id: "ai-google",
    title: "Google Advanced AI and Machine Learning Professional",
    provider: "Google Cloud",
    date: "Dec 2025",
    logoText: "G",
    credentialId: "G-AI-9938472",
    link: "https://credentials.google.com/verify/9938472"
  },
  {
    id: "react-meta",
    title: "Meta Front-End Developer Professional",
    provider: "Meta",
    date: "Aug 2025",
    logoText: "M",
    credentialId: "M-FE-881920",
    link: "https://coursera.org/verify/meta-fe-881920"
  },
  {
    id: "data-ibm",
    title: "IBM Data Science Professional Certificate",
    provider: "IBM",
    date: "Jun 2025",
    logoText: "I",
    credentialId: "IBM-DS-774920",
    link: "https://coursera.org/verify/ibm-ds-774920"
  }
];

export const CHATBOT_PROMPTS = [
  "Tell me about yourself",
  "What projects have you built?",
  "Show your AI projects",
  "Download your resume",
  "Know your skills"
];

export const CHATBOT_RESPONSES = {
  default: "Hi! I'm Yash's AI Assistant. I can answer questions about his skills, education, projects, and goals. Select one of the quick prompts above to get started!",
  "Tell me about yourself": "Yash Jain is a software engineer and AI enthusiast. He focuses on building clean, high-performance web applications that integrate intelligence and design. He is passionate about combining frontend styling (Next.js, Framer Motion) with backend structure and machine learning models.",
  "What projects have you built?": "Yash has built projects across AI/ML and frontend web development. Highlights include: 1) AI Nexus (semantic chat engine), 2) Vibe (editorial commerce), 3) FinInsight Dashboard (financial correlation maps), and 4) Predictive Health analytics models. Scroll to the Projects section to explore them!",
  "Show your AI projects": "Yash's AI projects include: **AI Nexus Assistant** (a RAG search assistant using LangChain) and **Predictive Health Analysis** (a risk classifier built with Random Forests in Python). He is also actively building AI chatbots like this one!",
  "Download your resume": "You can download Yash Jain's resume directly using the 'Download Resume' button at the top right of the navigation bar, or under the Hero section. We will also trigger a copy to download when you click the resume button!",
  "Know your skills": "Yash's skillset covers:\n• **Frontend**: React, Next.js, Tailwind CSS, JavaScript\n• **Backend & DB**: Node.js, SQL, MongoDB\n• **AI/ML/Data**: Python, Scikit-Learn, Pandas, statistics\n• **Design**: Figma, Canva, premium UI/UX prototyping."
};
