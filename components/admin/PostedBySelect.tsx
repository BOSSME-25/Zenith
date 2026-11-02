"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { inputClass, labelClass } from "@/components/forms/FormStatus";

const STORAGE_KEY = "zenith-posted-by";

/**
 * The admin is one shared password, so this is how a change is attributed.
 * The last name chosen is remembered in this browser so the Secretary is not
 * picking it on every save.
 */
export function PostedBySelect({ posters, id = "posted_by" }: { posters: string[]; id?: string }) {
  const ref = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && posters.includes(saved) && ref.current && !ref.current.value) {
        ref.current.value = saved;
      }
    } catch {
      // Storage blocked: the field just starts empty.
    }
  }, [posters]);

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        Posted by <span aria-hidden className="text-red-600">*</span>
      </label>
      <select
        ref={ref}
        id={id}
        name="posted_by"
        required
        defaultValue=""
        onChange={(e) => {
          try {
            localStorage.setItem(STORAGE_KEY, e.target.value);
          } catch {
            // ignore
          }
        }}
        className={inputClass}
      >
        <option value="" disabled>
          Choose your name
        </option>
        {posters.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {posters.length === 0 && (
        <p className="mt-1.5 text-sm text-red-600">
          Nobody is on the posting list yet.{" "}
          <Link href="/admin/settings" className="underline font-semibold">
            Add names in Site settings
          </Link>{" "}
          first.
        </p>
      )}
    </div>
  );
}
