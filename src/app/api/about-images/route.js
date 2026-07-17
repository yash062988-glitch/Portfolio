import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const IMAGES_DIR = path.join(process.cwd(), "images and refrences", "about page images");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (name) {
    // Prevent directory traversal
    const safeName = path.basename(name);
    const filePath = path.join(IMAGES_DIR, safeName);

    try {
      if (!fs.existsSync(filePath)) {
        return new Response("Not Found", { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(safeName).toLowerCase();
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.avif') contentType = 'image/avif';

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, must-revalidate',
        },
      });
    } catch (err) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(IMAGES_DIR);
    const supportedExts = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedExts.includes(ext);
    });

    return NextResponse.json(imageFiles);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}
