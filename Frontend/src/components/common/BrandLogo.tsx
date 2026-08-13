import React from "react";
import { Sparkles } from "lucide-react";

interface BrandLogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "medium",
  showTagline = true,
  className = "",
}) => {
  // Dimensions based on size prop
  const iconSize = size === "small" ? 32 : size === "large" ? 48 : 40;
  const titleFontSize = size === "small" ? "1.15rem" : size === "large" ? "1.75rem" : "1.45rem";
  const taglineFontSize = size === "small" ? "0.58rem" : size === "large" ? "0.75rem" : "0.68rem";

  return (
    <div className={`brand-logo-wrapper ${size} ${className}`}>
      {/* 💎 Faceted Golden Diamond Icon Container */}
      <div className="brand-icon-box" style={{ width: iconSize, height: iconSize }}>
        <div className="diamond-glow-halo" />
        
        {/* Animated Diamond SVG Emblem */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="diamond-svg-emblem"
        >
          <defs>
            <linearGradient id="goldGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe49e" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#aa7c11" />
            </linearGradient>

            <linearGradient id="goldGradientAccent" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f3e5ab" />
              <stop offset="100%" stopColor="#c59b27" />
            </linearGradient>

            <linearGradient id="facetHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(212, 175, 55, 0.2)" />
            </linearGradient>

            <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Diamond Top Table Facet */}
          <polygon points="20,14 44,14 54,28 10,28" fill="url(#goldGradientMain)" />

          {/* Crown Facets (Top Triangles) */}
          <polygon points="20,14 32,28 10,28" fill="url(#goldGradientAccent)" opacity="0.95" />
          <polygon points="44,14 32,28 54,28" fill="url(#goldGradientAccent)" opacity="0.95" />
          <polygon points="20,14 32,14 32,28" fill="url(#facetHighlight)" opacity="0.8" />
          <polygon points="44,14 32,14 32,28" fill="url(#facetHighlight)" opacity="0.6" />

          {/* Pavilion Facets (Bottom Point) */}
          <polygon points="10,28 32,56 32,28" fill="url(#goldGradientMain)" opacity="0.9" />
          <polygon points="54,28 32,56 32,28" fill="url(#goldGradientAccent)" />
          <polygon points="10,28 32,56 22,28" fill="url(#facetHighlight)" opacity="0.5" />
          <polygon points="54,28 32,56 42,28" fill="url(#goldGradientMain)" opacity="0.8" />

          {/* Diamond Outline & Facet Lines */}
          <polygon
            points="20,14 44,14 54,28 32,56 10,28"
            fill="none"
            stroke="#ffe49e"
            strokeWidth="1.8"
            strokeLinejoin="round"
            filter="url(#goldGlowFilter)"
          />
          <line x1="10" y1="28" x2="54" y2="28" stroke="#ffe49e" strokeWidth="1.2" opacity="0.85" />
          <line x1="20" y1="14" x2="32" y2="56" stroke="#ffe49e" strokeWidth="1" opacity="0.6" />
          <line x1="44" y1="14" x2="32" y2="56" stroke="#ffe49e" strokeWidth="1" opacity="0.6" />
        </svg>

        {/* Sparkling Star Particle Overlay */}
        <Sparkles size={iconSize * 0.45} className="logo-sparkle-star" />
      </div>

      {/* 📜 Luxury Brand Typography */}
      <div className="brand-text-column">
        <span className="brand-logo-title" style={{ fontSize: titleFontSize }}>
          GAHENA
        </span>
        {showTagline && (
          <span className="brand-logo-tagline" style={{ fontSize: taglineFontSize }}>
            LUXURY E-COMMERCE
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
