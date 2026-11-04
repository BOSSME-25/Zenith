import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { accessOf, getSession } from "@/lib/auth";
import { type Section, canAccess } from "@/lib/admin-access";
import { MAX_PDF_BYTES, MEETING_FILE_RE } from "@/lib/meetings-shared";

// Client-upload flow: the browser asks this route for a one-time upload token,
// then uploads the file straight to Vercel Blob (bypassing the function body
// limit). We authenticate at token-generation time — the onUploadCompleted
// callback is a server-to-server call from Vercel and carries no admin cookie,
// so we must NOT gate the whole handler on the cookie.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        const session = await getSession();
        if (!session || (session.kind === "user" && session.mustChangePassword)) {
          throw new Error("Unauthorized");
        }
        // Each kind of file is only for the people who manage what it belongs to.
        const folder = pathname.split("/")[0];
        const sections: Section[] =
          folder === "meetings"
            ? ["meetings", "settings"]
            : folder === "updates"
              ? ["updates"]
              : folder === "newsletter"
                ? ["newsletter"]
                : folder === "comets"
                  ? ["comets"]
                  : folder === "site"
                    ? ["settings"]
                    : [];
        if (!sections.some((s) => canAccess(accessOf(session), s))) {
          throw new Error("You do not have access to upload this kind of file.");
        }
        // Meeting documents are public records: PDF only, a fixed naming
        // pattern, and no random suffix or overwrite, so an earlier version
        // can never be replaced in storage by a later upload.
        if (pathname.startsWith("meetings/")) {
          if (!MEETING_FILE_RE.test(pathname)) {
            throw new Error("That file name is not allowed for a meeting document.");
          }
          return {
            allowedContentTypes: ["application/pdf"],
            maximumSizeInBytes: MAX_PDF_BYTES,
            addRandomSuffix: false,
            allowOverwrite: false,
          };
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No-op: the public URL is returned to the client directly.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
