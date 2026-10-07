import React from "react";
import { PawPrint } from "lucide-react";

interface FaunaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FaunaLogo({ className = "", size = "md" }: FaunaLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-forest-600 via-forest-700 to-forest-900 text-white shadow-md border border-forest-500/30 ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      {/* Detalhe sutil de folhagem/montanha em degradê */}
      <div className="absolute inset-0 rounded-inherit bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
      <PawPrint className={`${iconSizes[size]} text-amber-300 drop-shadow-sm transition-transform group-hover:scale-110 duration-200`} />
    </div>
  );
}
