"use client";

type FilterOption = { label: string; value: string };

type FilterField = {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterField[];
  rightSlot?: React.ReactNode;
  placeholder?: string;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  filters = [],
  rightSlot,
  placeholder = "Search…",
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((field) => (
            <label
              key={field.key}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {field.label}
              </span>
              <select
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
}
