"use client";

import { useState, useEffect } from "react";
import { PawPrint } from "lucide-react";

interface FaunaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  containerClassName?: string;
}

export function FaunaImage({
  src,
  alt = "Fauna Silvestre",
  fallbackTitle,
  className = "",
  containerClassName = "",
  ...props
}: FaunaImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div
        className={`w-full h-full min-h-[140px] flex flex-col items-center justify-center bg-forest-950/10 text-forest-800 p-4 border border-forest-200/50 rounded-xl text-center select-none ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center mb-2 text-forest-700 shadow-inner">
          <PawPrint className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[90%]">
          {fallbackTitle || alt}
        </span>
        <span className="text-[11px] text-forest-700/80 mt-0.5 font-medium">
          Fauna da Serra • Imagem em Curadoria
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}

