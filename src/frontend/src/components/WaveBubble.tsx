import { useMemo } from "react";

interface WaveBubbleProps {
  currentMl: number;
  goalMl: number;
}

export function WaveBubble({ currentMl, goalMl }: WaveBubbleProps) {
  const pct = useMemo(() => {
    const raw = goalMl > 0 ? (currentMl / goalMl) * 100 : 0;
    return Math.min(raw, 100);
  }, [currentMl, goalMl]);

  const isComplete = pct >= 100;

  return (
    <div
      data-ocid="tracker.bubble"
      className="relative bubble-pulse"
      style={{ width: 280, height: 280 }}
    >
      {/* Outer ring glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isComplete
            ? "radial-gradient(circle, rgba(0,119,255,0.18) 0%, rgba(0,119,255,0.04) 70%)"
            : "radial-gradient(circle, rgba(0,119,255,0.10) 0%, rgba(224,242,254,0.04) 70%)",
          transform: "scale(1.12)",
          transition: "background 0.8s ease",
        }}
      />

      {/* Main circle */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "#E0F2FE",
          boxShadow:
            "0 16px 48px rgba(0,119,255,0.22), 0 4px 16px rgba(0,119,255,0.10), inset 0 2px 8px rgba(255,255,255,0.9), inset 0 -2px 8px rgba(0,119,255,0.08)",
          border: "3px solid rgba(255,255,255,0.92)",
        }}
      >
        {/* Water fill container */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: `${pct}%`,
            transition: "height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Wave layer 1 */}
          <div
            className="wave-scroll-1"
            style={{
              position: "absolute",
              top: -20,
              left: 0,
              width: "200%",
              height: 40,
            }}
          >
            <svg
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ width: "100%", height: "100%" }}
            >
              <path
                d="M0,20 C25,5 75,35 100,20 C125,5 175,35 200,20 C225,5 275,35 300,20 C325,5 375,35 400,20 L400,40 L0,40 Z"
                fill="rgba(0, 119, 255, 0.85)"
              />
            </svg>
          </div>

          {/* Wave layer 2 */}
          <div
            className="wave-scroll-2"
            style={{
              position: "absolute",
              top: -14,
              left: 0,
              width: "200%",
              height: 36,
            }}
          >
            <svg
              viewBox="0 0 400 36"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ width: "100%", height: "100%" }}
            >
              <path
                d="M0,18 C30,3 70,33 100,18 C130,3 170,33 200,18 C230,3 270,33 300,18 C330,3 370,33 400,18 L400,36 L0,36 Z"
                fill="rgba(56, 189, 248, 0.50)"
              />
            </svg>
          </div>

          {/* Solid fill */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 0,
              right: 0,
              bottom: 0,
              background: isComplete
                ? "linear-gradient(180deg, #0077FF 0%, #005FCC 100%)"
                : "linear-gradient(180deg, #0077FF 0%, #0066DD 100%)",
              transition: "background 0.8s ease",
            }}
          />
        </div>

        {/* Text overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 10 }}
        >
          <span
            className="font-display font-black leading-none"
            style={{
              fontSize: 52,
              color: pct > 50 ? "rgba(255,255,255,0.95)" : "#0055CC",
              textShadow: pct > 50 ? "0 1px 4px rgba(0,40,120,0.25)" : "none",
              transition: "color 0.4s ease",
              letterSpacing: "-1px",
            }}
          >
            {currentMl}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color:
                pct > 50 ? "rgba(255,255,255,0.75)" : "rgba(0,85,200,0.65)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.4s ease",
              marginTop: 2,
            }}
          >
            of {goalMl} ml
          </span>
          {isComplete && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
                marginTop: 6,
                letterSpacing: "0.06em",
              }}
            >
              🎉 Goal reached!
            </span>
          )}
        </div>
      </div>

      {/* Percentage badge */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 glass rounded-full px-3 py-0.5"
        style={{ whiteSpace: "nowrap" }}
      >
        <span className="text-xs font-bold" style={{ color: "#0077FF" }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}
