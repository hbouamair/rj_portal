"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
  priority?: boolean;
}

export default function Logo({ className = "", size = "md", variant = "default", priority = false }: LogoProps) {
  const sizeClasses = {
    sm: "h-10 md:h-12",
    md: "h-14 md:h-16 lg:h-20",
    lg: "h-20 md:h-24 lg:h-28",
  };

  const widthMap: Record<string, { base: number; md: number; lg?: number }> = {
    sm: { base: 120, md: 140 },
    md: { base: 160, md: 200, lg: 240 },
    lg: { base: 240, md: 300, lg: 360 },
  };

  const heightMap: Record<string, { base: number; md: number; lg?: number }> = {
    sm: { base: 40, md: 48 },
    md: { base: 56, md: 64, lg: 80 },
    lg: { base: 80, md: 96, lg: 112 },
  };

  const logoSrc = variant === "white" ? "/logo_white.png" : "/logo.png";

  const currentWidth = widthMap[size]?.lg || widthMap[size]?.md || widthMap[size]?.base || 160;
  const currentHeight = heightMap[size]?.lg || heightMap[size]?.md || heightMap[size]?.base || 56;

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-start transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <Image
        src={logoSrc}
        alt="RJ Studio"
        width={currentWidth}
        height={currentHeight}
        className="w-auto h-full object-contain"
        priority={priority}
      />
    </div>
  );
}
