"use client";

import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function ErrorMessage({ message, onClose, duration = 5000 }: ErrorMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-red-50 border border-red-200 animate-slideInDown">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-700">{message}</span>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="text-red-500 hover:text-red-700 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}