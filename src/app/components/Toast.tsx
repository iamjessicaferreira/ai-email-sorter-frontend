import React, { useEffect, useState } from 'react';

export default function Toast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    
    const t = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDone, 300);
    }, 4000);
    
    return () => clearTimeout(t);
  }, [onDone]);
  
  return (
    <div 
      className={`
        bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-3 rounded-lg 
        shadow-elegant-hover backdrop-blur-sm border border-gray-700/50
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        min-w-[280px] max-w-md
      `}
      style={{
        animation: isVisible && !isExiting ? 'slideInRight 0.4s ease-out' : undefined
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg 
            className="w-5 h-5 text-green-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onDone, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
