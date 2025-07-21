// components/Toast.tsx
import React, { useEffect } from 'react';

export default function Toast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 10000);
    return () => clearTimeout(t);
  }, [onDone]);
  
  return (
    <div className="bg-gray-800 text-white px-4 py-2 rounded shadow transition-all duration-300">
    {message}
  </div>
  );
}
