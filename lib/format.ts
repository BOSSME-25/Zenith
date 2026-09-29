/**
 * Formatting helpers shared by server and client components.
 *
 * Deliberately not a "use client" module: the admin list pages are server
 * components and format timestamps during render. Exporting this from a client
 * module (as it previously was, from SubmissionTable) made every one of those
 * pages throw at runtime.
 */
export function formatSubmittedAt(value: string | Date): string {
  try {
    return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(value);
  }
}
