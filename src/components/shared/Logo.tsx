// NOTE: The cat mark is a geometric placeholder — the production SVG mascot needs
// a follow-up design pass once brand assets are available. The wordmark is correct.

type LogoVariant = "mark" | "wordmark" | "lockup";
type LogoTheme = "dark" | "light";

interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
}

// Geometric placeholder: rounded square with violet "k" + white check on navy bg.
// Swap this path set for the real cat mascot paths when the SVG is ready.
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

      {/* Body: rounded square */}
      <rect x="2" y="6" width="36" height="32" rx="10" fill={bodyFill} />

      {/* Ears: two violet triangles at top */}
      <polygon points="8,6 4,0 12,0" fill="#6D64FB" />
      <polygon points="32,6 28,0 36,0" fill="#6D64FB" />

      {/* Eyes: two small white dots (closed/content) */}
      <ellipse cx="14" cy="17" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="26" cy="17" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.9" />

      {/* Nose */}
      <path d="M18.5 22 L20 23.5 L21.5 22 L20 21 Z" fill="#6D64FB" />

      {/* Collar */}
      <rect x="6" y="29" width="28" height="3.5" rx="1.75" fill="#6D64FB" />

      {/* Check mark on chest — the product metaphor */}
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

// Wordmark: "klyro" — "k" in violet, "lyro" in primary/navy
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

  // lockup: mark + wordmark side by side
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`} aria-label="Klyro">
      <CatMark theme={theme} />
      <Wordmark theme={theme} />
    </span>
  );
}

export default Logo;
