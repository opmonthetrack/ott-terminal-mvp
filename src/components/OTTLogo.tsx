import { useState } from "react";

type LogoSize = "sm" | "md" | "lg" | "xl" | "hero";

type OTTLogoProps = {
  size?: LogoSize;
  showText?: boolean;
  subtitle?: string;
  className?: string;
};

const sizeClasses: Record<LogoSize, string> = {
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
  hero: "w-28 h-28 md:w-36 md:h-36 xl:w-44 xl:h-44",
};

const textSizeClasses: Record<LogoSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
  hero: "text-2xl md:text-3xl xl:text-4xl",
};

export function OTTLogo({
  size = "md",
  showText = true,
  subtitle = "XRPL OnTheTrack Terminal",
  className = "",
}: OTTLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} relative shrink-0 overflow-hidden border border-white/10 bg-black flex items-center justify-center`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.16),_transparent_65%)]" />

        {!imageFailed ? (
          <img
            src="/logo.png"
            alt="OnTheTrack logo"
            onError={() => setImageFailed(true)}
            className="relative z-10 w-full h-full object-contain p-1.5"
          />
        ) : (
          <span className="relative z-10 font-orbitron font-black text-white tracking-widest">
            OTT
          </span>
        )}
      </div>

      {showText && (
        <div className="min-w-0">
          <p
            className={`font-orbitron font-black uppercase tracking-widest leading-none ${textSizeClasses[size]}`}
          >
            OnTheTrack
          </p>

          <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-white/35 mt-2 truncate">
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}

export function OTTLogoMark({
  size = "md",
  className = "",
}: {
  size?: LogoSize;
  className?: string;
}) {
  return (
    <OTTLogo
      size={size}
      showText={false}
      className={className}
    />
  );
}

export function OTTProofBadge({
  sourceTag = "2606170002",
}: {
  sourceTag?: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
      <OTTLogoMark size="sm" />

      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
          OTT Proof Identity
        </p>

        <p className="font-orbitron text-xs font-black uppercase tracking-widest">
          SourceTag {sourceTag}
        </p>
      </div>
    </div>
  );
}
