import fs from "fs";
import path from "path";
import ClientHome from "@/components/ClientHome";

export default function Home() {
  let portraitImage = "/images/astronaut.png";
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      const candidate = files.find(file => 
        /\.(png|jpe?g|webp|svg)$/i.test(file) && 
        !file.includes("hero-bg") &&
        !file.includes("contact")
      );
      if (candidate) {
        portraitImage = `/images/${candidate}`;
      }
    }
  } catch (error) {
    console.error("Error dynamically loading portrait image:", error);
  }

  return <ClientHome portraitImage={portraitImage} />;
}
