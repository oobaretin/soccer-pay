"use client";

import { useEffect, useId, useMemo, useState } from "react";

export type PlayerOption = { slug: string; name: string; club: string };

type Props = {
  label: string;
  value: string;
  options: PlayerOption[];
  onChange: (slug: string) => void;
};

export function PlayerCombobox({ label, value, options, onChange }: Props) {
  const listId = useId();
  const selected = options.find((o) => o.slug === value);
  const [input, setInput] = useState(
    selected ? `${selected.name} (${selected.club})` : "",
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const o = options.find((p) => p.slug === value);
    if (o) setInput(`${o.name} (${o.club})`);
  }, [value, options]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return options.slice(0, 12);
    return options
      .filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.club.toLowerCase().includes(q) ||
          o.slug.includes(q.replace(/\s+/g, "-")),
      )
      .slice(0, 12);
  }, [input, options]);

  function pick(slug: string) {
    const o = options.find((p) => p.slug === slug);
    if (o) setInput(`${o.name} (${o.club})`);
    onChange(slug);
    setOpen(false);
  }

  return (
    <div className="relative flex flex-1 flex-col gap-1 text-sm">
      <label htmlFor={listId} className="font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        id={listId}
        type="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-listbox`}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Search by name or club"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
      />
      {open && filtered.length > 0 ? (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
        >
          {filtered.map((o) => (
            <li key={o.slug} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o.slug)}
              >
                <span className="font-medium">{o.name}</span>
                <span className="text-zinc-500"> · {o.club}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
