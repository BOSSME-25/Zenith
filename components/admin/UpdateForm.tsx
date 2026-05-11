"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
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

export function UpdateForm({ action, defaults, submitLabel, hiddenFields }: Props) {
  const [state, dispatch] = useActionState(action, idleState);
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(defaults?.slug));
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

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
        <label className={labelClass} htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          rows={14}
          required
          defaultValue={defaults?.body ?? ""}
          className={`${inputClass} font-mono text-sm leading-relaxed`}
          placeholder="Write your update. Paragraphs separated by blank lines render as paragraphs on the public page."
        />
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
