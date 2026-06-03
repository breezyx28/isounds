import { FunnelSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";

export interface ExploreFilters {
  category: string;
  sort: "latest" | "liked" | "viewed";
  durationMin: number;
  durationMax: number;
  from: string;
  to: string;
}

interface FilterPanelProps {
  categories: Category[];
  filters: ExploreFilters;
  onChange: (next: ExploreFilters) => void;
}

function PanelBody({ categories, filters, onChange }: FilterPanelProps) {
  const { t } = useTranslation("search");
  const inputClassName = "is-input mt-1";
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="filter-category" className="text-label text-text-muted">
          {t("category")}
        </label>
        <select
          id="filter-category"
          className={inputClassName}
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value })}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-label text-text-muted">{t("sortBy")}</p>
        <div className="mt-2 flex gap-2">
          {(["latest", "liked", "viewed"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant="toggle"
              size="sm"
              aria-pressed={filters.sort === option}
              data-state={filters.sort === option ? "on" : "off"}
              onClick={() => onChange({ ...filters, sort: option })}
            >
              {t(option)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="filter-duration-min" className="text-label text-text-muted">
            {t("durationMin")}
          </label>
          <input
            id="filter-duration-min"
            type="number"
            min={0}
            className={inputClassName}
            value={filters.durationMin}
            onChange={(event) =>
              onChange({ ...filters, durationMin: Number(event.target.value || 0) })
            }
          />
        </div>
        <div>
          <label htmlFor="filter-duration-max" className="text-label text-text-muted">
            {t("durationMax")}
          </label>
          <input
            id="filter-duration-max"
            type="number"
            min={0}
            className={inputClassName}
            value={filters.durationMax}
            onChange={(event) =>
              onChange({ ...filters, durationMax: Number(event.target.value || 0) })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="filter-date-from" className="text-label text-text-muted">
            {t("fromDate")}
          </label>
          <input
            id="filter-date-from"
            type="date"
            className={inputClassName}
            value={filters.from}
            onChange={(event) => onChange({ ...filters, from: event.target.value })}
          />
        </div>
        <div>
          <label htmlFor="filter-date-to" className="text-label text-text-muted">
            {t("toDate")}
          </label>
          <input
            id="filter-date-to"
            type="date"
            className={inputClassName}
            value={filters.to}
            onChange={(event) => onChange({ ...filters, to: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function FilterPanel({ categories, filters, onChange }: FilterPanelProps) {
  const { t } = useTranslation("search");
  return (
    <>
      <aside className="hidden rounded-2xl border border-border/70 bg-surface p-4 shadow-soft lg:block">
        <PanelBody categories={categories} filters={filters} onChange={onChange} />
      </aside>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
            >
              <FunnelSimple className="h-4 w-4" />
              {t("filters")}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-4">
            <PanelBody categories={categories} filters={filters} onChange={onChange} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
