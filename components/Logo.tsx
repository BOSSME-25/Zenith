import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "full-light" | "full-dark" | "wordmark-light" | "wordmark-dark" | "shield";

const SOURCES: Record<Variant, string> = {
  "full-light": "/brand/zenith-full-light.png",
  "full-dark": "/brand/zenith-full-dark.png",
  "wordmark-light": "/brand/zenith-wordmark-light.png",
  "wordmark-dark": "/brand/zenith-wordmark-dark.png",
  shield: "/brand/zenith-shield-dark.png",
};

type LogoProps = {
  variant?: Variant;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  href?: string | null;
  label?: string;
};

export function Logo({
  variant = "full-dark",
  className,
  width = 200,
  height = 64,
  priority = false,
  href = "/",
  label = "Zenith College and Career Prep — home",
}: LogoProps) {
  const img = (
    <Image
      src={SOURCES[variant]}
      alt="Zenith College and Career Prep"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
  if (!href) return img;
  return (
    <Link href={href} aria-label={label} className="inline-flex items-center">
      {img}
    </Link>
  );
}
