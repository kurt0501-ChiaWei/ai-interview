import Link from "next/link";
import Logo from "./logo";

const COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/interview", label: "開始模擬面試" },
      { href: "/#features", label: "功能介紹" },
      { href: "/#how", label: "使用流程" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#faq", label: "常見問題" },
      { href: "/#sample", label: "評分報告範例" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            在真正的面試之前，先和 AI 面試官練一次。依職缺出題、會追問、給你看得懂的建議。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink/80 transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} AI Interview</span>
          <span>AI 產生的內容僅供練習參考，請自行判斷。</span>
        </div>
      </div>
    </footer>
  );
}
