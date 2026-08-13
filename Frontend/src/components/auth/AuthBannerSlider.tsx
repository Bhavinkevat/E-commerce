import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Shield, Sparkles } from "lucide-react";

import banner1 from "../../assets/auth_banner_1.png";
import banner2 from "../../assets/auth_banner_2.png";
import banner3 from "../../assets/auth_banner_3.png";
import banner4 from "../../assets/auth_banner_4.png";

export interface SlideItem {
  id: number;
  image: string;
  subtitle: string;
  title: string;
  badge: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    image: banner1,
    subtitle: "EXCLUSIVE COLLECTION",
    title: "Timeless Elegance & Luxury Craftsmanship",
    badge: "Royal Edition",
  },
  {
    id: 2,
    image: banner2,
    subtitle: "ROYAL HERITAGE",
    title: "Handcrafted Emerald & Kundan Masterpieces",
    badge: "Artisan Craft",
  },
  {
    id: 3,
    image: banner3,
    subtitle: "BRIDAL SOLITAIRES",
    title: "Exquisite Diamond Rings & Bangle Sets",
    badge: "Precious Gems",
  },
  {
    id: 4,
    image: banner4,
    subtitle: "HERITAGE COUTURE",
    title: "Majestic Ruby & Pearl Statement Necklaces",
    badge: "Vintage Gold",
  },
];

export const AuthBannerSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prevSlide = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  };

  // Auto Play setup
  useEffect(() => {
    if (isHovered) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setDirection("right");
      setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isHovered]);

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      className="auth-banner-column"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        background: "#0d1310",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Background Images with Slide/Fade Transition */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive
                ? "scale(1)"
                : direction === "right"
                ? "scale(1.05)"
                : "scale(0.98)",
              transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: isActive ? 1 : 0,
              pointerEvents: "none",
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.9) contrast(1.05)",
              }}
            />
          </div>
        );
      })}

      {/* Dark Vignette and Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.85) 100%), linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Top Header: Brand Logo */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <Shield size={24} color="#ffffff" />
          </div>
          <span
            style={{
              fontSize: "1.45rem",
              fontWeight: "800",
              letterSpacing: "2px",
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            GAHENA
          </span>
        </div>

        {/* Badge Indicator */}
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "#e8f4ee",
            fontSize: "0.78rem",
            fontWeight: "600",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Sparkles size={14} color="#d4af37" />
          <span>{currentSlide.badge}</span>
        </div>
      </div>

      {/* Left Navigation Arrow Button */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        style={{
          position: "absolute",
          left: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(15, 23, 19, 0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(31, 111, 89, 0.85)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 19, 0.45)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
        }}
      >
        <ChevronLeft size={26} strokeWidth={2.5} />
      </button>

      {/* Right Navigation Arrow Button */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        style={{
          position: "absolute",
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(15, 23, 19, 0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(31, 111, 89, 0.85)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 19, 0.45)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
        }}
      >
        <ChevronRight size={26} strokeWidth={2.5} />
      </button>

      {/* Bottom Content Overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          color: "#ffffff",
          maxWidth: "540px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div key={currentSlide.id} style={{ animation: "fadeInSlideText 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}>
          <p
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "#6ee7b7",
              fontWeight: "700",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "24px",
                height: "2px",
                background: "#6ee7b7",
                borderRadius: "2px",
              }}
            />
            {currentSlide.subtitle}
          </p>
          <h2
            style={{
              fontSize: "2.3rem",
              fontWeight: "800",
              lineHeight: "1.25",
              margin: 0,
              color: "#ffffff",
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {currentSlide.title}
          </h2>
        </div>

        {/* Slider Pagination Controls (Dots & Counter) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "12px",
          }}
        >
          {SLIDES.map((slide, index) => {
            const active = index === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "6px",
                    width: active ? "32px" : "10px",
                    borderRadius: "6px",
                    background: active
                      ? "linear-gradient(90deg, #6ee7b7 0%, #34d399 100%)"
                      : "rgba(255, 255, 255, 0.35)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: active ? "0 0 10px rgba(110, 231, 183, 0.6)" : "none",
                  }}
                />
              </button>
            );
          })}

          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "rgba(255, 255, 255, 0.7)",
              letterSpacing: "1.5px",
            }}
          >
            0{currentIndex + 1} / 0{SLIDES.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthBannerSlider;
