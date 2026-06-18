/**
 * Resolved URL for Jay's welcome video.
 *
 * In production the video is served from Vercel Blob — set
 * NEXT_PUBLIC_WELCOME_VIDEO_URL to the public Blob URL (see
 * scripts/upload-welcome-video.mjs to upload it and get that URL).
 *
 * For local development it falls back to the file under /public/video,
 * so the popup and Our Story embed work without any Blob setup.
 */
export const WELCOME_VIDEO_URL =
  process.env.NEXT_PUBLIC_WELCOME_VIDEO_URL || "/video/jay-welcome.mov";
