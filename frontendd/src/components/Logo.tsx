export const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      <defs>
        <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>

        <radialGradient id="glowGradient" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer orbit ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#glowGradient)"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Middle orbit ring */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.5"
        opacity="0.4"
      />

      {/* Inner orbit ring */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Center glowing sphere */}
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="url(#centerGradient)"
        filter="url(#glow)"
      />

      {/* Center highlight */}
      <circle
        cx="48"
        cy="48"
        r="4"
        fill="#fef3c7"
        opacity="0.8"
      />

      {/* Orbiting planets */}
      {/* Top purple planet */}
      <circle cx="50" cy="15" r="4" fill="#a78bfa" filter="url(#glow)" opacity="0.9" />

      {/* Top left green planet */}
      <circle cx="30" cy="28" r="3.5" fill="#86efac" filter="url(#glow)" opacity="0.85" />

      {/* Right green planet */}
      <circle cx="70" cy="45" r="3.5" fill="#6ee7b7" filter="url(#glow)" opacity="0.85" />

      {/* Bottom right orange planet */}
      <circle cx="62" cy="72" r="4" fill="#fb923c" filter="url(#glow)" opacity="0.9" />

      {/* Bottom orange planet */}
      <circle cx="50" cy="80" r="3" fill="#f97316" filter="url(#glow)" opacity="0.8" />

      {/* Bottom left blue planet */}
      <circle cx="25" cy="65" r="3.5" fill="#60a5fa" filter="url(#glow)" opacity="0.85" />

      {/* Tiny starfield decorations */}
      <circle cx="15" cy="20" r="1" fill="#fbbf24" opacity="0.6" />
      <circle cx="85" cy="30" r="0.8" fill="#86efac" opacity="0.5" />
      <circle cx="20" cy="75" r="1.2" fill="#60a5fa" opacity="0.6" />
      <circle cx="80" cy="70" r="0.9" fill="#fb923c" opacity="0.5" />
    </svg>
  );
};
