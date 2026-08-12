import { Clock } from "./Clock";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 grid grid-cols-3 items-center px-[max(1rem,env(safe-area-inset-left))] pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))]">
      <div className="justify-self-start">
        <Clock />
      </div>

      <div className="justify-self-center rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65 backdrop-blur-md">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent align-middle" />
        1,248 listening
      </div>

      <nav aria-label="Social links" className="justify-self-end flex items-center gap-3 text-[11px] font-medium text-white/65">
        <a className="transition hover:text-white" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        <a className="transition hover:text-white" href="https://x.com" target="_blank" rel="noreferrer">X</a>
      </nav>
    </header>
  );
}
