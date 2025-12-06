"use client";

import React from "react";

interface JitsiEmbedProps {
  meetingLink: string;
  width?: string;
  height?: string;
  className?: string;
}

/**
 * JitsiEmbed Component
 * Embeds a Jitsi meeting using iframe
 */
export default function JitsiEmbed({
  meetingLink,
  width = "100%",
  height = "600px",
  className = "",
}: JitsiEmbedProps) {
  if (!meetingLink) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">Invalid meeting link</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={meetingLink}
        width={width}
        height={height}
        frameBorder="0"
        allow="camera; microphone; fullscreen; display-capture"
        className="rounded-lg shadow-lg"
        title="Jitsi Meeting"
      />
    </div>
  );
}
