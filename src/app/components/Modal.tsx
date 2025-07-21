// components/Modal.tsx
import React, { ReactNode, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, children }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen) return null;
  return (
    <div
    className="fixed inset-0 bg-[rgba(50,50,60,0.35)] flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl p-6 max-w-2xl w-full relative shadow-lg max-h-[80vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
        {/* O scroll está aqui: */}
        <div className="overflow-y-auto pr-2" style={{ maxHeight: "70vh" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
