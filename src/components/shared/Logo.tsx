import Image from "next/image";

type LogoVariant = "mark" | "wordmark" | "lockup";
type LogoTheme = "dark" | "light";

interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
}

// Geometric placeholder — swap for dedicated mark asset when available.
function CatMark({ theme }: { theme: LogoTheme }) {
  const bodyFill = theme === "dark" ? "url(#grad-brand)" : "#14143A";

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D64FB" />
          <stop offset="100%" stopColor="#14143A" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="36" height="32" rx="10" fill={bodyFill} />
      <polygon points="8,6 4,0 12,0" fill="#6D64FB" />
      <polygon points="32,6 28,0 36,0" fill="#6D64FB" />
      <ellipse cx="14" cy="17" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="26" cy="17" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.9" />
      <path d="M18.5 22 L20 23.5 L21.5 22 L20 21 Z" fill="#6D64FB" />
      <rect x="6" y="29" width="28" height="3.5" rx="1.75" fill="#6D64FB" />
      <path
        d="M14 21.5 L18 25.5 L26 17.5"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wordmark placeholder — swap for dedicated wordmark asset when available.
function Wordmark({ theme }: { theme: LogoTheme }) {
  const lyroColor = theme === "dark" ? "#FFFFFF" : "#14143A";

  return (
    <svg
      width="72"
      height="32"
      viewBox="0 0 72 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="klyro"
    >
      <text
        x="0"
        y="24"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="28"
        fontWeight="800"
        letterSpacing="-0.02em"
        fill="#6D64FB"
      >
        k
      </text>
      <text
        x="18"
        y="24"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="28"
        fontWeight="800"
        letterSpacing="-0.02em"
        fill={lyroColor}
      >
        lyro
      </text>
    </svg>
  );
}

export function Logo({ variant = "lockup", theme = "dark", className }: LogoProps) {
  if (variant === "mark") {
    return (
      <span className={className} aria-label="Klyro">
        <CatMark theme={theme} />
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={className}>
        <Wordmark theme={theme} />
      </span>
    );
  }

  // lockup: production PNG asset
  return (
    <span className={`inline-flex items-center ${className ?? ""}`} aria-label="Klyro">
      <Image
        src="/klyro_logo_w.png"
        alt="Klyro"
        width={280}
        height={102}
        priority
      
      />
    </span>
  );
}

export default Logo;
