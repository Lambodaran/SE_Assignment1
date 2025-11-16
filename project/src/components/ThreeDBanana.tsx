import React from "react";

const ThreeDBanana: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 1. Main Body Gradient (Unchanged) */}
        <linearGradient id="bananaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF59D" /> {/* Lighter top */}
          <stop offset="50%" stopColor="#FFEE58" />
          <stop offset="100%" stopColor="#FBC02D" /> {/* Darker bottom */}
        </linearGradient>

        {/* 2. NEW Brown Stem Gradient */}
        <linearGradient id="brownStemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" /> {/* Light brown */}
          <stop offset="100%" stopColor="#5D4037" /> {/* Dark brown */}
        </linearGradient>

        {/* 3. Highlight (Unchanged) */}
        <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* --- BANANA SHAPE (Stem Modified) --- */}
      <g>
        {/* 1. Main Banana Body (Unchanged) */}
        <path
          d="
            M 40 150 
            C 80 50, 180 60, 180 110 
            C 180 130, 80 110, 50 160 
            L 40 150 Z
          "
          fill="url(#bananaGradient)"
        />

        {/* 2. Stem (Smaller, straighter, and brown) */}
        <path
          d="
            M 180 110
            C 178 95, 182 85, 178 80
            L 182 82
            C 187 87, 185 95, 180 110 Z
          "
          fill="url(#brownStemGradient)"
        />

        {/* 3. Bottom Tip (Unchanged) */}
        <path
          d="M 40 150 L 50 160 C 45 165, 35 160, 40 150 Z"
          fill="#5D4037" /* Dark brown tip */
        />

        {/* 4. Highlight Curve (Unchanged) */}
        <path
          d="M 60 140 C 100 80, 160 80, 170 105"
          fill="none"
          stroke="url(#highlightGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  );
};

export default ThreeDBanana;