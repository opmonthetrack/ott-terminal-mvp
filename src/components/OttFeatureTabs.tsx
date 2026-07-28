import type { ElementType } from "react";

export type OttFeatureTab<TId extends string> = {
  id: TId;
  label: string;
  description?: string;
  icon: ElementType;
  badge?: string;
};

type OttFeatureTabsProps<TId extends string> = {
  items: OttFeatureTab<TId>[];
  activeId: TId;
  onChange: (id: TId) => void;
  ariaLabel: string;
};

export function OttFeatureTabs<TId extends string>({
  items,
  activeId,
  onChange,
  ariaLabel,
}: OttFeatureTabsProps<TId>) {
  return (
    <nav
      aria-label={ariaLabel}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-current={active ? "page" : undefined}
            className={`group min-w-0 rounded-2xl border p-4 text-left transition ${
              active
                ? "border-transparent bg-slate-950 text-white shadow-xl shadow-violet-200/30"
                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${
                  active
                    ? "bg-white/10 text-white"
                    : "bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] text-white shadow-lg shadow-violet-200/50"
                }`}
              >
                <span
                  className="absolute h-7 w-7 rotate-45 rounded-[7px] border border-white/35"
                  aria-hidden="true"
                />
                <Icon className="relative z-10" size={20} strokeWidth={1.9} />
              </span>

              {item.badge && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    active ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm font-semibold leading-5">{item.label}</p>
            {item.description && (
              <p className={`mt-1.5 text-xs leading-5 ${active ? "text-white/65" : "text-slate-500"}`}>
                {item.description}
              </p>
            )}
          </button>
        );
      })}
    </nav>
  );
}
