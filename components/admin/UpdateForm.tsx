"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2 } from "lucide-react";
import { idleState, slugify, type ActionState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";

type Defaults = {
  title?: string;
  slug?: string;
  body?: string;
  published?: boolean;
  publish_date?: string;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Defaults;
  submitLabel: string;
  hiddenFields?: Record<string, string>;
};

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

export function UpdateForm({ action, defaults, submitLabel, hiddenFields }: Props) {
  const [state, dispatch] = useActionState(action, idleState);
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(defaults?.slug));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

  function insertAtCursor(text: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
    const pos = start + text.length;
    ta.focus();
    ta.setSelectionRange(pos, pos);
  }

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const pathname = `updates/${sanitizeName(file.name) || "image"}`;
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      const alt = file.name.replace(/\.[^.]+$/, "");
      insertAtCursor(`\n\n![${alt}](${blob.url})\n\n`);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={dispatch} className="space-y-5">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <div>
        <label className={labelClass} htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <FieldError message={fe.title} />
      </div>
      <div>
        <label className={labelClass} htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          className={`${inputClass} font-mono`}
        />
        <p className="mt-1 text-xs text-midnight-75">
          Public URL: <code>/updates/{slug || "your-slug"}</code>
        </p>
        <FieldError message={fe.slug} />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <label className="block text-sm font-semibold text-midnight" htmlFor="body">Body</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-ion bg-white px-3.5 py-1.5 text-xs font-semibold text-midnight hover:border-eventide disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={14} aria-hidden /> Add image
              </>
            )}
          </button>
        </div>
        <textarea
          id="body"
          name="body"
          ref={bodyRef}
          rows={14}
          required
          defaultValue={defaults?.body ?? ""}
          className={`${inputClass} font-mono text-sm leading-relaxed`}
          placeholder="Write your update. Paragraphs separated by blank lines render as paragraphs on the public page. Use the Add image button to insert a photo."
        />
        {uploadError && <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>}
        <p className="mt-1.5 text-xs text-midnight-75">
          Click <strong>Add image</strong> to upload a photo (JPG, PNG, WebP, or GIF, up to 10&nbsp;MB). It is inserted where your cursor is as <code>![caption](link)</code> and shows as a picture on the published page.
        </p>
        <FieldError message={fe.body} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border border-ion bg-white px-4 py-3 cursor-pointer hover:border-eventide">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaults?.published ?? true}
            className="accent-midnight"
          />
          <span className="text-sm font-medium text-midnight">Published</span>
        </label>
        <div>
          <label className={labelClass} htmlFor="publish_date">Publish date</label>
          <input
            id="publish_date"
            name="publish_date"
            type="date"
            defaultValue={defaults?.publish_date ?? ""}
            className={inputClass}
          />
          <FieldError message={fe.publish_date} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/updates" className="text-sm font-semibold text-eventide hover:underline">
          Cancel
        </Link>
      </div>
      <FormStatus state={state} />
    </form>
  );
}
