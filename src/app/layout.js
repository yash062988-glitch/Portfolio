import { Space_Grotesk } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceGrotesk.variable} font-sans text-white bg-[#0b0705] antialiased`}>
        {children}
      </body>
    </html>
  );
}
