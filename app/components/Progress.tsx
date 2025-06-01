import React from "react";

interface ProgressProps {
  value: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  height = 16,
  color = "#4f46e5", // Indigo-600
  backgroundColor = "#e5e7eb", // Gray-200
  showLabel = true,
}) => {
  return (
    <div
      style={{
        background: backgroundColor,
        borderRadius: height / 2,
        height,
        width: "100%",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        position: "relative",
      }}
      aria-label="Progress bar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    >
      <div
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          background: `linear-gradient(90deg, ${color} 0%, #6366f1 100%)`,
          height: "100%",
          borderRadius: height / 2,
          transition: "width 0.4s cubic-bezier(.4,1.3,.6,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: showLabel ? "flex-end" : "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: height * 0.6,
          paddingRight: showLabel ? 12 : 0,
        }}
      >
        {showLabel && (
          <span style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default Progress;