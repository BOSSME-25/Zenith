import { cn } from "@/lib/cn";

type SectionProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bg?: "white" | "ion-soft" | "midnight" | "ion";
  align?: "left" | "center";
};

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  bg = "ion-soft",
  align = "left",
}: SectionProps) {
  const bgClass = {
    white: "bg-white",
    "ion-soft": "bg-ion-soft",
    midnight: "bg-midnight text-white",
    ion: "bg-ion",
  }[bg];
  const titleColor = bg === "midnight" ? "text-white" : "text-midnight";
  const eyebrowColor = bg === "midnight" ? "text-ion" : "text-eventide";
  const descColor = bg === "midnight" ? "text-white/85" : "text-midnight-75";
  return (
    <section className={cn(bgClass, "py-16 md:py-24", className)}>
      <div className="container-prose">
        {(eyebrow || title || description) && (
          <div className={cn("max-w-3xl mb-10 md:mb-12", align === "center" && "mx-auto text-center")}>
            {eyebrow && (
              <p className={cn("eyebrow", eyebrowColor)}>{eyebrow}</p>
            )}
            {title && (
              <h2 className={cn("mt-4 text-3xl md:text-4xl font-semibold leading-tight", titleColor)}>
                {title}
              </h2>
            )}
            {description && (
              <p className={cn("mt-4 text-lg leading-relaxed", descColor)}>{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
