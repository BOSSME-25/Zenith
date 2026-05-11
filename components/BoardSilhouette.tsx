type Props = { className?: string };

export function BoardSilhouette({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      role="presentation"
    >
      <rect width="120" height="120" rx="12" fill="#EFF8FB" />
      <circle cx="60" cy="46" r="20" fill="#BEE5EE" />
      <path
        d="M22 110 C22 88, 40 78, 60 78 C80 78, 98 88, 98 110 Z"
        fill="#BEE5EE"
      />
    </svg>
  );
}
