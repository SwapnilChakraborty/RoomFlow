import React from 'react';

export function Logo({ className = "", showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tight text-primary">
          Room<span className="text-accent">Flow</span>
        </span>
      )}
    </div>
  );
}
