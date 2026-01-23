import React, { ReactNode, useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, children }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Only close on Escape if not typing in an input/textarea
      if (e.key === "Escape") {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen && !isAnimating) return null;
  
  return (
    <div
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50
        transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
      style={{
        animation: isOpen ? 'fadeIn 0.3s ease-out' : undefined
      }}
    >
      <div
        className={`
          bg-white rounded-2xl max-w-5xl w-full mx-4 relative 
          shadow-elegant-hover max-h-[90vh] flex flex-col
          transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Prevent Escape key from closing when typing in inputs or textareas
          const target = e.target as HTMLElement;
          if (e.key === 'Escape' && (
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.isContentEditable
          )) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        style={{
          animation: isOpen ? 'scaleIn 0.3s ease-out' : undefined
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-500">Email Content</h3>
              </div>
            </div>
          </div>
          <button
            className="
              flex-shrink-0 text-gray-400 hover:text-gray-900 
              w-10 h-10 flex items-center justify-center rounded-lg
              hover:bg-gray-100 transition-all duration-200 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              group
            "
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg 
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
