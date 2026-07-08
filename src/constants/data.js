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
    id: "ai-nexus",
    title: "AI Nexus Assistant",
    category: "AI",
    shortDesc: "A semantic search and intelligent multi-agent chat interface powered by custom LLMs.",
    desc: "AI Nexus is a modern chat interface designed to simplify information retrieval using retrieval-augmented generation (RAG) and multi-agent workflows. It provides real-time semantic analysis and clean user feedback.",
    problem: "Traditional search engines return links, not answers. Users spend excessive time parsing irrelevant results to answer complex, multi-layered technical queries.",
    solution: "We built a multi-agent system that searches documents, synthesizes answers using a local LLM, and presents structured insights alongside original document references.",
    challenges: "Handling long-context windows and optimizing vector DB latency were significant challenges. We solved this by implementing a semantic chunking strategy and metadata pre-filtering.",
    tech: ["Next.js", "Python", "Tailwind CSS", "LangChain", "Vector DB"],
    github: "https://github.com/yashjain/ai-nexus",
    demo: "https://demo.yashjain.com/ai-nexus",
    image: "/images/hero-bg.png"
  },
  {
    id: "cinematic-vibe",
    title: "Vibe - Editorial Commerce",
    category: "Web",
    shortDesc: "A luxury product experience featuring fluid animations, webGL hover grids, and ultra-minimal UI.",
    desc: "Vibe is an editorial e-commerce exploration that treats products like art pieces. It features high-end typography, horizontal scrolling, and custom page transitions.",
    problem: "Most commercial platforms are crowded, overstimulating, and lack a sense of brand value and luxury, leading to low customer conversion for premium brands.",
    solution: "An immersive e-commerce layout emphasizing large typography, detailed zoom animations, and generous whitespace to create a premium, calm shopping atmosphere.",
    challenges: "Achieving 60fps scrolling performance while loading high-resolution assets. We used customized image loaders and virtualized lists for asset loading.",
    tech: ["React", "Framer Motion", "Tailwind CSS", "Next.js", "Context API"],
    github: "https://github.com/yashjain/vibe-editorial",
    demo: "https://demo.yashjain.com/vibe-editorial",
    image: "/images/hero-bg.png"
  },
  {
    id: "predictive-health",
    title: "Predictive Health Analysis",
    category: "Machine Learning",
    shortDesc: "A predictive analytics model to classify health risk profiles using biometric data and Random Forests.",
    desc: "This platform provides patients and doctors with health risk projections based on physical metrics, using an ensemble ML pipeline for reliable diagnostics.",
    problem: "Early disease indicators are often overlooked in routine checkups, missing critical opportunities for preventative care and early intervention.",
    solution: "A machine learning pipeline that parses patient vitals, compares them against demographic baselines, and visualizes risk vectors with transparent explanation metrics.",
    challenges: "Dealing with highly imbalanced class distributions in medical datasets. We utilized SMOTE for oversampling and optimized the model using PR-AUC curves.",
    tech: ["Python", "Scikit-Learn", "Pandas", "Streamlit", "Matplotlib"],
    github: "https://github.com/yashjain/predictive-health",
    demo: "https://demo.yashjain.com/predictive-health",
    image: "/images/hero-bg.png"
  },
  {
    id: "financial-analytics",
    title: "FinInsight Dashboard",
    category: "Data Analysis",
    shortDesc: "An interactive dashboard visualizing financial market trends and performing portfolio optimizations.",
    desc: "FinInsight tracks asset performances, generates heatmaps, and applies modern portfolio theory (Markowitz optimization) to simulate optimal risk-adjusted returns.",
    problem: "Retail investors struggle to analyze complex correlation matrices and portfolio allocations without expensive professional financial software.",
    solution: "A visual browser dashboard that recalculates portfolio efficiency frontiers in real-time as users modify asset selections and weights.",
    challenges: "Performing heavy matrix calculations client-side without locking the UI main thread. This was resolved using Web Workers for off-main-thread math processing.",
    tech: ["React", "D3.js", "Tailwind CSS", "Web Workers"],
    github: "https://github.com/yashjain/fin-insight",
    demo: "https://demo.yashjain.com/fin-insight",
    image: "/images/hero-bg.png"
  },
  {
    id: "portfolio-ui",
    title: "Cinematic UI Design System",
    category: "UI Design",
    shortDesc: "A highly crafted, reusable system of tokens and glassmorphic cards optimized for dark editorial designs.",
    desc: "A design system built for dark, premium product pages. It outlines glass parameters, radial glow systems, micro-interactions, and accessible typography grids.",
    problem: "Inconsistent glass card opacities, borders, and blur depths across projects dilutes visual premium and increases development handoff times.",
    solution: "A library of CSS variables and matching Tailwind utility presets that standardize editorial aesthetics and support rapid prototyping.",
    challenges: "Ensuring proper contrast and legibility on dynamic, shifting backgrounds. We created a dynamic overlay wrapper that adjusts darkness automatically based on backdrop values.",
    tech: ["Figma", "Tailwind CSS", "React", "Storybook"],
    github: "https://github.com/yashjain/editorial-ui-system",
    demo: "https://demo.yashjain.com/editorial-ui-system",
    image: "/images/hero-bg.png"
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
