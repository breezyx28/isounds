import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import {
  useAddSearchHistoryMutation,
  useClearSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useGetSearchHistoryQuery,
} from "@/store/localApi";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export function SearchInput({ value, onChange, onSubmit }: SearchInputProps) {
  const { t } = useTranslation(["search", "common"]);
  const [focused, setFocused] = useState(false);
  const { data: history = [] } = useGetSearchHistoryQuery();
  const [addHistory] = useAddSearchHistoryMutation();
  const [deleteHistory] = useDeleteSearchHistoryMutation();
  const [clearHistory] = useClearSearchHistoryMutation();

  const topHistory = useMemo(() => history.slice(0, 10), [history]);

  const commitQuery = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    await addHistory({ query: trimmed });
    onSubmit?.(trimmed);
  };

  return (
    <div className="relative">
      <div className="flex items-center rounded-xl border border-border/70 bg-surface px-3 py-2 shadow-soft">
        <MagnifyingGlass className="h-5 w-5 text-text-muted" />
        <label htmlFor="search-input" className="sr-only">
          {t("search:placeholder")}
        </label>
        <input
          id="search-input"
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void commitQuery(value);
          }}
          className="w-full bg-transparent px-2 text-body-md text-text outline-none"
          placeholder={t("search:placeholder")}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-raised"
            aria-label={t("search:clear")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {focused && topHistory.length > 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-border/70 bg-surface p-2 shadow-soft">
          <ul className="max-h-64 space-y-1 overflow-auto">
            {topHistory.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-surface-raised">
                <button
                  type="button"
                  className="flex-1 text-start text-body-md text-text"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(item.query);
                    void commitQuery(item.query);
                  }}
                >
                  {item.query}
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-text-muted hover:bg-surface"
                  aria-label={t("search:deleteHistoryItem")}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    void deleteHistory(item.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 text-label text-primary"
            onMouseDown={(event) => {
              event.preventDefault();
              void clearHistory();
            }}
          >
            {t("search:clearHistory")}
          </button>
        </div>
      )}
    </div>
  );
}
