type CometBackdropProps = {
  className?: string;
};

/**
 * Decorative geometric backdrop in brand colors.
 * Pulls from the comet motif in the Zenith shield without bitmap imagery.
 */
export function CometBackdrop({ className }: CometBackdropProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      role="presentation"
    >
      <defs>
        <radialGradient id="cometGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BEE5EE" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#BEE5EE" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#06243F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cometTrail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06243F" stopOpacity="0" />
          <stop offset="100%" stopColor="#BEE5EE" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <circle cx="950" cy="160" r="220" fill="url(#cometGlow)" />
      <g opacity="0.85">
        <path d="M150 480 L820 200" stroke="url(#cometTrail)" strokeWidth="2" />
        <path d="M250 530 L880 220" stroke="url(#cometTrail)" strokeWidth="1.5" opacity="0.7" />
        <path d="M340 560 L920 240" stroke="url(#cometTrail)" strokeWidth="1" opacity="0.5" />
      </g>
      <circle cx="950" cy="160" r="44" fill="#BEE5EE" />
      <circle cx="942" cy="152" r="14" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}
