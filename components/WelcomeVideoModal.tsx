"use client";

import { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "zenith-welcome-video-seen";
const VIDEO_SRC = "/video/jay-welcome.mov";

/**
 * Site-wide welcome popup that plays a short video from Jay the first time
 * someone visits in a given browser session. Autoplays muted (so it works
 * within browser autoplay rules) with a one-tap unmute, and can be closed
 * with the X button, a backdrop click, or the Escape key.
 */
export function WelcomeVideoModal() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage unavailable (private mode / blocked) — show once.
    }
    if (!seen) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }

    // Lock background scroll while the modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    // Move focus to the close button for keyboard/screen-reader users.
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    if (!next) {
      v.play().catch(() => {});
    }
    setMuted(next);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="A welcome from Jay"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close welcome video"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-midnight/10 overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-ion">
          <div>
            <p className="eyebrow text-eventide">Welcome to Zenith</p>
            <h2 className="mt-1 text-lg font-semibold text-midnight leading-tight">
              A quick hello from Jay
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex-none rounded-full p-2 text-midnight-75 hover:bg-ion-soft hover:text-midnight transition-colors"
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        <div className="relative bg-midnight">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            className="w-full max-h-[70vh] bg-midnight"
            autoPlay
            muted
            playsInline
            controls
            preload="auto"
          />
          {muted && (
            <button
              type="button"
              onClick={toggleMute}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-ion px-5 py-2.5 text-sm font-semibold text-midnight shadow-lg hover:bg-white transition-colors"
            >
              <VolumeX size={18} aria-hidden />
              Tap to unmute
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex items-center gap-2 text-sm font-medium text-midnight-75 hover:text-midnight transition-colors"
          >
            {muted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-eventide transition-colors"
          >
            Continue to site
          </button>
        </div>
      </div>
    </div>
  );
}
