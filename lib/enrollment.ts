import { SITE_URL } from "@/lib/site";

/**
 * Where "Apply Now" goes.
 *
 * Until NEXT_PUBLIC_APPLICATION_URL is set, the site's main button stays "Join
 * the interest list". The moment it is set, "Apply Now" becomes the main button
 * everywhere and the interest list becomes a smaller option for families who
 * are not ready.
 *
 * Set it to /apply to send families to the application page on this site (the
 * embedded form), or to a full https:// link to send them straight to the form.
 * It is a public address, so it is safe in the browser. Changing it needs a
 * redeploy.
 */
const raw = process.env.NEXT_PUBLIC_APPLICATION_URL?.trim();

const isPagePath = (v: string) => /^\/[A-Za-z0-9\-_/]*$/.test(v) && !v.startsWith("//");
const isHttps = (v: string) => /^https:\/\/\S+$/i.test(v);

export const APPLICATION_URL: string | null = raw && (isPagePath(raw) || isHttps(raw)) ? raw : null;

/** True for an address on another site, which should open in a new tab. */
export const APPLICATION_IS_EXTERNAL = APPLICATION_URL ? isHttps(APPLICATION_URL) : false;

/** A full address, for places a relative one will not work, such as an email. */
export const APPLICATION_ABSOLUTE_URL: string | null = APPLICATION_URL
  ? APPLICATION_IS_EXTERNAL
    ? APPLICATION_URL
    : `${SITE_URL}${APPLICATION_URL}`
  : null;

export const INTEREST_LIST_HREF = "/get-involved#family";

/**
 * The Cognito application form. These are public: the embed address is what the
 * form's own "embed" snippet contains, and the public link is the same form on
 * Cognito's page.
 */
export const COGNITO_EMBED_SRC = "https://www.cognitoforms.com/f/cPPrzcXztUe5Mni8nyJFTQ/58";
export const COGNITO_SCRIPT_SRC = "https://www.cognitoforms.com/f/iframe.js";
export const COGNITO_PUBLIC_URL = "https://www.cognitoforms.com/MariposaConsultingGroup1/ApplyNow";
export const APPLY_PAGE_PATH = "/apply";
