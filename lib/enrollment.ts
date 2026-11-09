/**
 * The online application (the Cognito form).
 *
 * Until this is set, the site's main button stays "Join the interest list".
 * The moment it is set, "Apply Now" becomes the main button everywhere and the
 * interest list becomes a smaller option for families who are not ready.
 *
 * Set NEXT_PUBLIC_APPLICATION_URL to the full https:// link in the hosting
 * settings and redeploy. It is a public address, so it is safe in the browser.
 */
const raw = process.env.NEXT_PUBLIC_APPLICATION_URL?.trim();

export const APPLICATION_URL: string | null = raw && /^https:\/\/\S+$/i.test(raw) ? raw : null;

export const INTEREST_LIST_HREF = "/get-involved#family";
