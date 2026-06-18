// Uploads Jay's welcome video to Vercel Blob and prints the public URL.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... npm run upload:video -- <path-to-video>
//
// Examples:
//   npm run upload:video -- public/video/jay-welcome.mp4
//   npm run upload:video -- "/Users/emilybelt/Desktop/Web Projects/ZenithWebsite/jay-welcome.mp4"
//   npm run upload:video            # defaults to public/video/jay-welcome.mov
//
// Then set the printed URL as NEXT_PUBLIC_WELCOME_VIDEO_URL in your
// environment (Vercel project settings / .env.local). The welcome popup and
// the Our Story embed will serve from Blob instead of the in-repo file.

import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { put } from "@vercel/blob";

const src = process.argv[2] || "public/video/jay-welcome.mov";

const CONTENT_TYPES = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
};
const ext = extname(src).toLowerCase();
const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
const dest = `welcome/${basename(src)}`;

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN. Get it from your Vercel project " +
      "(Storage → your Blob store → .env.local snippet) and re-run with it set.",
  );
  process.exit(1);
}

let data;
try {
  data = await readFile(src);
} catch {
  console.error(`Could not read "${src}". Pass the path to your video file as an argument.`);
  process.exit(1);
}

console.log(`Uploading ${src} (${(data.length / 1024 / 1024).toFixed(1)} MB, ${contentType})…`);

const blob = await put(dest, data, {
  access: "public",
  contentType,
  addRandomSuffix: false,
  allowOverwrite: true,
});

console.log("\nUploaded to Vercel Blob:");
console.log(blob.url);
console.log("\nNext step — set this in your environment:");
console.log(`NEXT_PUBLIC_WELCOME_VIDEO_URL=${blob.url}\n`);
