import Link from "next/link";
import { MAX_QUESTIONS } from "@/lib/interview";

const ROLES = ["前端工程師", "後端工程師", "產品經理", "資料分析師", "UI/UX 設計師", "行銷企劃", "專案經理", "業務"];

const FEATURES = [
  {
    no: "01",
    title: "依職缺量身出題",
    body: "貼上 JD，面試官會抓出職缺真正在意的技能與情境，而不是背題庫的通用問題。",
  },
  {
    no: "02",
    title: "會追問的面試官",
    body: "回答太籠統？面試官會像真人一樣往下挖，逼你把經驗講清楚、講具體。",
  },
  {
    no: "03",
    title: "評分與具體建議",
    body: "結束後拿到 0–100 分、整體評語，以及「優點」和「改進方向」兩張清單。",
  },
  {
    no: "04",
    title: "逐題示範回答",
    body: "每一題都附上以你的經驗為基礎、用 STAR 結構改寫的示範回答，照著練就能進步。",
  },
];

const STEPS = [
  { title: "貼上職缺描述", body: `把想應徵的職缺內容貼進來，並選擇要練習的題數（1–${MAX_QUESTIONS} 題）。` },
  { title: "一題一題回答", body: "面試官一次只問一題，並根據你的回答決定追問或換個角度出題。" },
  { title: "拿到完整報告", body: "總分、優缺點、改進建議，加上每一題的回饋與示範回答。" },
];

const FAQ = [
  {
    q: "需要註冊或付費嗎？什麼是 BYOK？",
    a: "不需要註冊，本服務也不向你收費。我們採用 BYOK（Bring Your Own Key）模式：在右上角的設定中填入你自己的 OpenAI API Key，模型使用費用會直接由你的 OpenAI 帳戶計算。",
  },
  {
    q: "我的面試內容會被儲存嗎？",
    a: "我們的伺服器不會保存你的職缺描述、回答或 API Key。Key 只存在你瀏覽器的 localStorage，每次請求時隨同面試內容送到伺服器、立即轉發給 OpenAI 產生題目與評分。重新整理頁面後面試紀錄就會消失。",
  },
  {
    q: "可以練習哪些職缺？",
    a: "任何職缺都可以。只要貼上職缺描述，面試官就會依內容調整題目方向，技術職、商業職、設計職都適用。",
  },
  {
    q: "評分準確嗎？",
    a: "評分由 AI 依照職缺需求與你的回答產生，適合用來找出盲點與練習表達，但不代表任何公司的實際錄取標準。",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PrimaryCTA({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/interview"
      className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-white shadow-[0_8px_24px_-8px_var(--accent)] transition-colors hover:bg-accent-hover"
    >
      {children}
      <ArrowIcon />
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{children}</p>;
}

/* Hero 右側的產品示意畫面（靜態範例） */
function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent-soft blur-2xl" />
      <div className="rotate-1 rounded-2xl border border-line bg-surface p-5 shadow-xl shadow-ink/5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Question 2 / 3</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-6 rounded-full bg-accent" />
            <span className="h-1.5 w-6 rounded-full bg-accent" />
            <span className="h-1.5 w-6 rounded-full bg-line" />
          </span>
        </div>
        <div className="space-y-3 text-sm leading-relaxed">
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-line bg-paper px-4 py-3">
            <p className="mb-1 text-[11px] font-semibold text-muted">面試官</p>
            你提到首屏載入快了 40%，能具體說說你是怎麼找出瓶頸的嗎？
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-paper">
            我先用 Lighthouse 和 Performance 面板分析，發現主要卡在一個 800KB 的圖表套件……
          </div>
          <div className="flex items-center gap-1.5 px-1 text-muted">
            <span className="typing-dot size-1.5 rounded-full bg-muted" />
            <span className="typing-dot size-1.5 rounded-full bg-muted [animation-delay:0.2s]" />
            <span className="typing-dot size-1.5 rounded-full bg-muted [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-8 -left-6 -rotate-3 rounded-2xl border border-line bg-surface px-5 py-4 shadow-lg shadow-ink/5 sm:-left-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">總分</p>
        <p className="font-serif text-4xl font-black text-accent">
          82<span className="ml-1 text-base font-semibold text-muted">/100</span>
        </p>
      </div>
    </div>
  );
}

/* 評分報告範例 */
function SampleReport() {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-end gap-2">
          <span className="font-serif text-6xl font-black text-accent">82</span>
          <span className="mb-2 text-muted">/ 100</span>
        </div>
        <p className="text-sm leading-relaxed text-ink/80">
          具備扎實的 React 效能優化經驗，能用數據說明成果；但在團隊協作與取捨判斷上的描述較少。
        </p>
        <div>
          <p className="mb-2 text-xs font-semibold text-good">優點</p>
          <ul className="space-y-1.5 text-sm text-ink/80">
            <li>・能量化成果（首屏快 40%）</li>
            <li>・清楚說明分析工具與步驟</li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-warn">改進建議</p>
          <ul className="space-y-1.5 text-sm text-ink/80">
            <li>・補充與後端、設計協作的經驗</li>
            <li>・說明做技術取捨時的判斷依據</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">第 1 題 · 逐題檢討</p>
        <p className="font-medium">請分享一次你優化前端效能的經驗。</p>
        <div className="rounded-xl bg-paper p-4 text-sm leading-relaxed text-ink/70">
          <p className="mb-1 text-xs font-semibold text-muted">你的回答</p>
          我用 memo 和 code splitting 讓首屏快了 40%。
        </div>
        <div className="rounded-xl border border-good/30 bg-good-soft p-4 text-sm leading-relaxed">
          <p className="mb-1 text-xs font-semibold text-good">建議回答方式</p>
          在上一份工作中，後台首頁載入需要 4 秒，客服常抱怨（情境）。我負責找出瓶頸並改善（任務）。我先用 Lighthouse 分析，發現圖表套件佔了 800KB，於是改成動態載入，並對大型列表做 memo（行動）。最後首屏時間降到 2.4 秒，客服抱怨明顯減少（結果）。
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 opacity-60" />
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24 lg:pb-32">
          <div className="animate-rise">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              AI 面試模擬器
            </p>
            <h1 className="font-serif text-4xl leading-[1.2] font-black tracking-tight sm:text-5xl lg:text-6xl">
              在真正的面試之前，
              <br />
              先和 <span className="text-accent">AI 面試官</span>
              <br />
              過一次招。
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              貼上職缺描述，面試官會依職缺出題、針對你的回答追問，最後給你評分、具體建議，以及每一題的示範回答。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <PrimaryCTA>開始模擬面試</PrimaryCTA>
              <Link href="/#sample" className="px-2 py-3 text-sm font-medium text-ink underline-offset-4 hover:underline">
                看看評分報告長什麼樣子
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted">不用註冊・使用你自己的 OpenAI Key・不保存你的資料</p>
          </div>
          <div className="animate-rise [animation-delay:150ms]">
            <HeroMock />
          </div>
        </div>
      </section>

      {/* ───────── 適用職缺 ───────── */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:px-6 md:flex-row">
          <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted">適用各種職缺</p>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {ROLES.map((role) => (
              <span key={role} className="rounded-full border border-line px-3 py-1 text-sm text-ink/80">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 功能 ───────── */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>Features</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl leading-snug font-black sm:text-4xl">
              不是題庫，
              <br />
              是一位真的在聽你說話的面試官。
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.no} className="group bg-surface p-8 transition-colors hover:bg-paper">
                <span className="font-mono text-sm text-accent">{f.no}</span>
                <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 使用流程 ───────── */}
      <section id="how" className="scroll-mt-16 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">How it works</p>
          <h2 className="mt-3 font-serif text-3xl font-black sm:text-4xl">三個步驟，十分鐘練完一場面試。</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative border-t border-paper/20 pt-6">
                <span className="font-serif text-5xl font-black text-paper/15">{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-paper/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── 報告範例 ───────── */}
      <section id="sample" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <Eyebrow>Sample report</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-black sm:text-4xl">面試結束，你會拿到這份報告。</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              以下為示意範例。實際內容會依你的職缺描述與回答即時產生。
            </p>
          </div>
          <SampleReport />
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section id="faq" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-black sm:text-4xl">常見問題</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-10 leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 最後 CTA ───────── */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -top-10 left-6 font-serif text-[12rem] leading-none font-black text-white/10 select-none">
            “
          </div>
          <h2 className="relative font-serif text-3xl font-black sm:text-4xl">下一場面試，不再臨場發揮。</h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/85">現在就貼上職缺描述，開始你的第一場模擬面試。</p>
          <Link
            href="/interview"
            className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-medium text-accent transition-transform hover:-translate-y-0.5"
          >
            開始模擬面試
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
