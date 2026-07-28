import { useEffect, useState } from "react";

const EXTENSIONS = ["svg", "png", "webp", "jpg", "jpeg"] as const;

type BrandAssetLogoProps = {
  basePath: string;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
};

export function BrandAssetLogo({
  basePath,
  alt,
  fallback,
  className = "h-11 w-11",
  imageClassName = "h-full w-full object-contain",
}: BrandAssetLogoProps) {
  const [extensionIndex, setExtensionIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setExtensionIndex(0);
    setFailed(false);
  }, [basePath]);

  if (failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-sm font-bold text-white ${className}`}
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 ${className}`}>
      <img
        src={`${basePath}.${EXTENSIONS[extensionIndex]}`}
        alt={alt}
        loading="lazy"
        className={imageClassName}
        onError={() => {
          if (extensionIndex < EXTENSIONS.length - 1) {
            setExtensionIndex((value) => value + 1);
          } else {
            setFailed(true);
          }
        }}
      />
    </span>
  );
}
