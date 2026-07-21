import { useState, type CSSProperties } from "react";

type LogoPreset = "sm" | "md" | "lg" | "xl" | "hero";
type LogoSize = LogoPreset | number;

type OTTLogoProps = {
  size?: LogoSize;
  showText?: boolean;
  subtitle?: string;
  className?: string;
};

const sizeClasses: Record<LogoPreset, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
  hero: "h-28 w-28 md:h-36 md:w-36 xl:h-44 xl:w-44",
};

const textSizeClasses: Record<LogoPreset, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
  hero: "text-2xl md:text-3xl xl:text-4xl",
};

function getNumericTextSize(size: number) {
  if (size <= 36) return "text-xs";
  if (size <= 52) return "text-sm";
  if (size <= 72) return "text-base";
  return "text-xl";
}

export function OTTLogo({
  size = "md",
  showText = true,
  subtitle = "XRPL OnTheTrack Terminal",
  className = "",
}: OTTLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const numericSize = typeof size === "number" ? Math.max(24, Math.min(size, 240)) : null;
  const markClass = numericSize === null ? sizeClasses[size] : "";
  const markStyle: CSSProperties | undefined = numericSize === null
    ? undefined
    : { width: numericSize, height: numericSize };
  const textSizeClass = numericSize === null ? textSizeClasses[size] : getNumericTextSize(numericSize);

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <div
        style={markStyle}
        className={`${markClass} relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}
      >
        {!imageFailed ? (
          <img
            src="/logo.png"
            alt="OnTheTrack logo"
            onError={() => setImageFailed(true)}
            className="relative z-10 h-full w-full object-contain p-1"
          />
        ) : (
          <span className="relative z-10 font-orbitron text-xs font-black tracking-widest text-slate-950">
            OTT
          </span>
        )}
      </div>

      {showText && (
        <div className="min-w-0">
          <p className={`font-orbitron font-black uppercase leading-none tracking-widest text-slate-950 ${textSizeClass}`}>
            OnTheTrack
          </p>
          <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.25em] text-slate-400 md:text-[10px]">
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
  return <OTTLogo size={size} showText={false} className={className} />;
}

export function OTTProofBadge({
  sourceTag = "2606170002",
}: {
  sourceTag?: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <OTTLogoMark size="sm" />
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400">
          OTT Proof Identity
        </p>
        <p className="font-orbitron text-xs font-black uppercase tracking-widest text-slate-950">
          SourceTag {sourceTag}
        </p>
      </div>
    </div>
  );
}
