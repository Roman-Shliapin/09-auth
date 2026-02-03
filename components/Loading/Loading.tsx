import css from './Loading.module.css';

export default function Loading() {
  return (
    <div className={css.wrapper} role="status" aria-live="polite" aria-busy="true">
      <div className={css.spinner} />
      <span className={css.text}>Loading…</span>
    </div>
  );
}
