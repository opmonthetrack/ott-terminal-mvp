import { getOttVisual } from "../lib/ottVisualLanguage";

export type OttCategoryTabItem = {
  id: string;
  label: string;
  count: number;
};

type OttCategoryTabsProps = {
  items: OttCategoryTabItem[];
  selectedId: string;
  isEnglish: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function OttCategoryTabs({
  items,
  selectedId,
  isEnglish,
  onSelect,
  disabled = false,
  ariaLabel,
}: OttCategoryTabsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      role="tablist"
      aria-label={ariaLabel ?? (isEnglish ? "Source categories" : "Broncategorieën")}
    >
      {items.map((item) => {
        const visual = getOttVisual(item.label);
        const Icon = visual.icon;
        const active = selectedId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="ott-source-results"
            disabled={disabled}
            onClick={() => onSelect(item.id)}
            className={`group min-w-0 rounded-2xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50 ${
              active
                ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/15" : "bg-slate-100 text-blue-700 group-hover:bg-white"}`}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
                {item.count}
              </span>
            </div>
            <span className="mt-3 block truncate text-sm font-semibold" title={item.label}>
              {visual.key === "other" ? item.label : visual.shortLabel}
            </span>
            <span className={`mt-1 hidden text-[11px] leading-4 sm:block ${active ? "text-slate-300" : "text-slate-500"}`}>
              {isEnglish ? visual.descriptionEn : visual.descriptionNl}
            </span>
          </button>
        );
      })}
    </div>
  );
}
