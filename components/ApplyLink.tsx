import Link from "next/link";
import { APPLICATION_IS_EXTERNAL, APPLICATION_URL } from "@/lib/enrollment";

/**
 * A link to the application, for wherever Apply Now appears. An address on
 * another site opens in a new tab (and says so to a screen reader); a page on
 * this site is an ordinary link. Renders nothing until the application is set.
 */
export function ApplyLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  if (!APPLICATION_URL) return null;
  if (APPLICATION_IS_EXTERNAL) {
    return (
      <a href={APPLICATION_URL} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={APPLICATION_URL} className={className}>
      {children}
    </Link>
  );
}
