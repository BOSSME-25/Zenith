import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getNoticeLocation } from "@/lib/meetings";

/**
 * The statutory notice has to name the physical place notices are posted as
 * well as the website. Zenith has no building yet, so this stays unset until
 * the board designates a place by vote. Until then the public page names the
 * website only, and this banner says so.
 */
export async function NoticeLocationBanner() {
  const { location } = await getNoticeLocation();
  if (location) return null;
  return (
    <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-white p-4">
      <AlertTriangle size={20} className="mt-0.5 flex-none text-red-600" aria-hidden />
      <p className="text-sm leading-relaxed text-midnight">
        <strong className="font-semibold">Notice location not set.</strong> The public notice names
        the website only, because no physical posting location has been entered. The board
        designates one by vote and records it in its minutes.{" "}
        <Link href="/admin/settings" className="font-semibold underline">
          Set it in Site settings
        </Link>
        .
      </p>
    </div>
  );
}
