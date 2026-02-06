"use client";

import React, { useState, useEffect } from "react";

export default function PrototypeBanner() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 500);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`
        w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200
        px-4 py-3 text-center transition-all duration-500
        ${fading ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}
      `}
    >
      <div className="flex items-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 flex-1">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Prototype mode</span> — Real-time notifications are disabled in production. Check the sidebar for details.
          </p>
        </div>
        <button
          onClick={() => {
            setFading(true);
            setTimeout(() => setVisible(false), 500);
          }}
          className="ml-4 text-amber-400 hover:text-amber-700 transition-colors flex-shrink-0"
          aria-label="Close banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
