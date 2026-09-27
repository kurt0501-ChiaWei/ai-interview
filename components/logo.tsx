import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-paper transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 4v-4h0.5A2.5 2.5 0 0 1 5 12.5z" strokeLinejoin="round" />
          <circle cx="15.5" cy="9.5" r="1.3" fill="var(--accent)" stroke="none" />
        </svg>
      </span>
      <span className="font-serif text-lg font-black tracking-tight text-ink">
        AI Interview
      </span>
    </Link>
  );
}
