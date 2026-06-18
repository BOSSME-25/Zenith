// Uploads Jay's welcome video to Vercel Blob and prints the public URL.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... node scripts/upload-welcome-video.mjs
//   # or, with the token already in .env.local on Vercel:  npm run upload:video
//
// Then set the printed URL as NEXT_PUBLIC_WELCOME_VIDEO_URL in your
// environment (Vercel project settings / .env.local). The welcome popup and
// the Our Story embed will serve from Blob instead of the in-repo file.

import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const SRC = "public/video/jay-welcome.mov";
const DEST = "welcome/jay-welcome.mov";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN. Get it from your Vercel project " +
      "(Storage → your Blob store → .env.local snippet) and re-run with it set.",
  );
  process.exit(1);
}

const data = await readFile(SRC);

const blob = await put(DEST, data, {
  access: "public",
  contentType: "video/quicktime",
  addRandomSuffix: false,
  allowOverwrite: true,
});

console.log("\nUploaded to Vercel Blob:");
console.log(blob.url);
console.log("\nNext step — set this in your environment:");
console.log(`NEXT_PUBLIC_WELCOME_VIDEO_URL=${blob.url}\n`);
