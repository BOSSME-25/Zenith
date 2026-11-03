import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
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
        if (!(await isAuthenticated())) {
          throw new Error("Unauthorized");
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
