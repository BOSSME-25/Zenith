"use client";

import { useRef, useState, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { addMeetingDocument } from "@/app/actions/meeting";
import { type ActionState, idleState } from "@/lib/validators";
import { FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { MAX_PDF_BYTES, type DocKind } from "@/lib/meetings-shared";

/**
 * Uploads a PDF straight to Blob under the standard file name, then records it
 * against the meeting. Files cannot be replaced in storage: a replacement gets
 * the next version number, and the earlier file stays where it is.
 */
export function DocumentUploader({
  meetingId,
  kind,
  fileBaseName,
  submitLabel,
}: {
  meetingId: string;
  kind: DocKind;
  /** e.g. zenith-board-agenda-2026-11-12 or ...-v2, already worked out by the server. */
  fileBaseName: string;
  submitLabel: string;
}) {
  const [state, setState] = useState<ActionState>(idleState);
  const [busy, setBusy] = useState(false);
  const [minutesStatus, setMinutesStatus] = useState<"draft" | "approved">("draft");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setState({ status: "error", message: "Choose a PDF first." });
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setState({ status: "error", message: "Only PDF files can be posted." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setState({ status: "error", message: "That file is over 25 MB. Make it smaller and try again." });
      return;
    }

    setBusy(true);
    setState(idleState);
    try {
      const blob = await upload(`meetings/${fileBaseName}.pdf`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: "application/pdf",
      });
      fd.delete("file");
      fd.set("id", meetingId);
      fd.set("kind", kind);
      fd.set("blob_url", blob.url);
      fd.set("size_bytes", String(file.size));
      const result = await addMeetingDocument(fd);
      setState(result);
      if (result.status === "success" && fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "The upload failed.";
      setState({
        status: "error",
        message: /already exists/i.test(message)
          ? "A file with this name is already in storage. Reload the page; if it still fails, ask the web team."
          : `The upload did not finish. ${message}`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor={`file_${kind}_${fileBaseName}`}>PDF file</label>
        <input
          ref={fileRef}
          id={`file_${kind}_${fileBaseName}`}
          name="file"
          type="file"
          accept="application/pdf"
          className="block w-full text-sm text-midnight file:mr-4 file:rounded-full file:border-0 file:bg-ion file:px-4 file:py-2 file:text-sm file:font-semibold file:text-midnight hover:file:bg-ion-75"
        />
        <p className="mt-1.5 text-xs text-midnight-75">
          Saved as <code>{fileBaseName}.pdf</code>. Text-based PDFs work best; avoid phone photos of
          paper.
        </p>
      </div>

      {(kind === "packet" || kind === "other") && (
        <div>
          <label className={labelClass} htmlFor={`label_${kind}`}>Label</label>
          <input
            id={`label_${kind}`}
            name="label"
            type="text"
            maxLength={120}
            placeholder={kind === "packet" ? "Board packet" : "Short description"}
            className={inputClass}
          />
        </div>
      )}

      {kind === "minutes" && (
        <>
          <div role="alert" className="rounded-xl border border-red-300 bg-white p-4 text-sm text-midnight">
            <strong className="font-semibold">Public minutes only.</strong> Do not upload executive
            session minutes or materials.
          </div>
          <fieldset>
            <legend className={labelClass}>These minutes are</legend>
            <div className="flex flex-wrap gap-3">
              {(["draft", "approved"] as const).map((v) => (
                <label
                  key={v}
                  className="flex items-center gap-2 rounded-lg border border-ion bg-white px-4 py-2 cursor-pointer min-h-11"
                >
                  <input
                    type="radio"
                    name="minutes_status"
                    value={v}
                    checked={minutesStatus === v}
                    onChange={() => setMinutesStatus(v)}
                  />
                  <span className="text-sm text-midnight">
                    {v === "draft" ? "Draft, pending board approval" : "Approved by the board"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {minutesStatus === "approved" && (
            <div className="max-w-xs">
              <label className={labelClass} htmlFor="approved_on">Date the board approved them</label>
              <input id="approved_on" name="approved_on" type="date" className={inputClass} />
            </div>
          )}
        </>
      )}

      <SubmitButton
        label={submitLabel}
        pendingLabel="Uploading…"
        pending={busy}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-6 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-11"
      />
      <div role="status" aria-live="polite">
        <FormStatus state={state} />
      </div>
    </form>
  );
}
