import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeController from "@/components/ThemeController";
import UfoCompanion from "@/components/UfoCompanion";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Yash Jain | Portfolio",
  description: "Personal portfolio of Yash Jain, a developer, AI enthusiast, and problem solver. Discover interactive web design, machine learning projects, and certifications.",
  keywords: ["Yash Jain", "Portfolio", "Next.js", "AI Enthusiast", "Web Developer", "Machine Learning", "Data Analytics"],
  authors: [{ name: "Yash Jain" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              var saved = localStorage.getItem("accent-theme");
              var presets = {
                "Solar Gold": { p: "#D8B15B", s: "#F0C979", g: "rgba(216, 177, 91, 0.35)", r: "216, 177, 91" },
                "Plasma Blue": { p: "#4DA6FF", s: "#8BD2FF", g: "rgba(77, 166, 255, 0.35)", r: "77, 166, 255" },
                "Nebula Purple": { p: "#8B5CF6", s: "#C084FC", g: "rgba(139, 92, 246, 0.35)", r: "139, 92, 246" },
                "Aurora Cyan": { p: "#38E8FF", s: "#9AF7FF", g: "rgba(56, 232, 255, 0.35)", r: "56, 232, 255" },
                "Emerald Core": { p: "#22C55E", s: "#6EE7A5", g: "rgba(34, 197, 94, 0.35)", r: "34, 197, 94" },
                "Mars Copper": { p: "#C57B57", s: "#E4A67D", g: "rgba(197, 123, 87, 0.35)", r: "197, 123, 87" },
                "Crimson Nova": { p: "#FF4D6D", s: "#FF8AA0", g: "rgba(255, 77, 109, 0.35)", r: "255, 77, 109" },
                "Lunar White": { p: "#F4F4F4", s: "#FFFFFF", g: "rgba(255, 255, 255, 0.35)", r: "255, 255, 255" }
              };
              var theme = presets[saved] || presets["Solar Gold"];
              var root = document.documentElement;
              root.style.setProperty("--accent-primary", theme.p);
              root.style.setProperty("--accent-secondary", theme.s);
              root.style.setProperty("--accent-glow", theme.g);
              root.style.setProperty("--accent-glow-raw", theme.r);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans text-white bg-black antialiased`}>
        {children}
        <ThemeController />
        <UfoCompanion />
      </body>
    </html>
  );
}
