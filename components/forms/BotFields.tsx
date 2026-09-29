"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/**
 * The client half of the bot protection in lib/bot-guard.ts: an off-screen
 * honeypot, a form-load timestamp, and the Turnstile widget.
 *
 * Drop this inside any public <form>. Rendering nothing visible is the point —
 * apart from the Turnstile widget, a real visitor never notices it.
 */
export function BotFields({
  formId,
  turnstile = true,
}: {
  /** Unique per form on the page, so ids stay unique when forms share a page. */
  formId: string;
  turnstile?: boolean;
}) {
  const loadedAt = useRef<number>(0);
  const [stamp, setStamp] = useState(0);
  // NEXT_PUBLIC_* is inlined at build time, so this is readable on the client.
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;
  const showTurnstile = turnstile && Boolean(siteKey);

  useEffect(() => {
    loadedAt.current = Date.now();
    setStamp(loadedAt.current);
  }, []);

  return (
    <>
      {showTurnstile && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      )}

      <input type="hidden" name="form_loaded_at" value={stamp} />

      {/* Positioned off-screen rather than display:none, which the more capable
          bots detect and skip. Hidden from assistive technology too. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`website_${formId}`}>Website</label>
        <input
          id={`website_${formId}`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {showTurnstile && (
        <div className="cf-turnstile" data-sitekey={siteKey as string} data-theme="light" />
      )}
    </>
  );
}
