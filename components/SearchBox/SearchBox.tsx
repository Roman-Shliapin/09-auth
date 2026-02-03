'use client';

import css from './SearchBox.module.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <label className={css.label}>
      <span className={css.srOnly}>Search notes</span>
      <input
        className={css.input}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        autoComplete="off"
      />
    </label>
  );
}
