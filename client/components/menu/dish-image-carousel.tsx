"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type DishImageCarouselProps = {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  intervalMs?: number;
  showDots?: boolean;
};

export function DishImageCarousel({
  images,
  alt,
  className,
  imageClassName,
  sizes = "112px",
  intervalMs = 5000,
  showDots = true,
}: DishImageCarouselProps) {
  const urls = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [urls.join("|")]);

  useEffect(() => {
    if (urls.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % urls.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [urls.length, intervalMs]);

  if (!urls.length) return null;

  return (
    <div className={cn("relative", className)}>
      {urls.map((src, imageIndex) => (
        <Image
          key={`${src}-${imageIndex}`}
          src={src}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-700",
            imageIndex === index ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
          sizes={sizes}
          priority={imageIndex === 0}
        />
      ))}
      {showDots && urls.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
          {urls.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index
                  ? "w-3 bg-white"
                  : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
