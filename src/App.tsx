import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "./components/Markdown";
import TableOfContents from "./components/TableOfContents";
import { CONTENT_VERSION, DEFAULT_CONTENT } from "./content";
import { extractHeadings } from "./lib/markdown";

const DOC_KEY = `reader.doc.${CONTENT_VERSION}`;
const PREFS_KEY = "reader.prefs.v2";

type Prefs = { fontSize: number; dark: boolean; raw: boolean };

const DEFAULT_PREFS: Prefs = { fontSize: 17, dark: false, raw: false };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const Icon = ({ path, className = "h-4 w-4" }: { path: string; className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  copy: "M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2ZM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  print: "M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z",
  sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m11.32 0 1.41 1.41M4.93 4.93l1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z",
  reset: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5",
  check: "M4 12.5 9 17.5 20 6.5",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
};

function ToolButton({
  onClick,
  label,
  icon,
  active,
}: {
  onClick: () => void;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
      ].join(" ")}
    >
      <Icon path={icon} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function App() {
  const [source, setSource] = useState<string>(() => localStorage.getItem(DOC_KEY) ?? DEFAULT_CONTENT);
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Prefs) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [raw, setRaw] = useState(false);
  const [draft, setDraft] = useState(source);
  const [toast, setToast] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const headings = useMemo(() => extractHeadings(source), [source]);

  useEffect(() => localStorage.setItem(DOC_KEY, source), [source]);
  useEffect(() => localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)), [prefs]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", prefs.dark);
  }, [prefs.dark]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? clamp((window.scrollY / max) * 100, 0, 100) : 0);

      const nodes = headings
        .map((h) => document.getElementById(h.id))
        .filter((n): n is HTMLElement => Boolean(n));
      let current: string | null = null;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top - 140 <= 0) current = node.id;
        else break;
      }
      setActiveId(current ?? nodes[0]?.id ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = source;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setToast("Текст скопирован в буфер обмена");
  }, [source]);

  const download = useCallback(() => {
    const blob = new Blob([source], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "otvet.md";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Файл otvet.md сохранён");
  }, [source]);

  const startEdit = () => {
    setDraft(source);
    setRaw(true);
  };

  const saveEdit = () => {
    setSource(draft);
    setRaw(false);
    setToast("Изменения сохранены");
  };

  const words = useMemo(() => source.trim().split(/\s+/).filter(Boolean).length, [source]);
  const readMinutes = Math.max(1, Math.round(words / 180));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed inset-x-0 top-0 z-30 h-0.5 bg-transparent no-print">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5">
          <div className="mr-auto min-w-0">
            <p className="truncate text-sm font-semibold">{headings[0]?.text ?? "Полный ответ"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {words} слов · ~{readMinutes} мин чтения
            </p>
          </div>

          <button
            onClick={() => setTocOpen((v) => !v)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/70 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            title="Оглавление"
          >
            <Icon path={ICONS.list} />
          </button>

          <div className="hidden items-center gap-0.5 sm:flex">
            <button
              onClick={() => setPrefs((p) => ({ ...p, fontSize: clamp(p.fontSize - 1, 13, 24) }))}
              className="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800"
              title="Меньше"
            >
              A−
            </button>
            <span className="w-8 text-center text-xs tabular-nums text-slate-400">{prefs.fontSize}</span>
            <button
              onClick={() => setPrefs((p) => ({ ...p, fontSize: clamp(p.fontSize + 1, 13, 24) }))}
              className="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800"
              title="Больше"
            >
              A+
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <ToolButton
              onClick={() => (raw ? saveEdit() : startEdit())}
              label={raw ? "Готово" : "Править"}
              icon={raw ? ICONS.check : ICONS.edit}
              active={raw}
            />
            <ToolButton onClick={copyAll} label="Копировать" icon={ICONS.copy} />
            <ToolButton onClick={download} label="Скачать" icon={ICONS.download} />
            <ToolButton onClick={() => window.print()} label="Печать" icon={ICONS.print} />
            <button
              onClick={() => setPrefs((p) => ({ ...p, dark: !p.dark }))}
              title="Тема"
              className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Icon path={prefs.dark ? ICONS.sun : ICONS.moon} />
            </button>
            <button
              onClick={() => {
                setSource(DEFAULT_CONTENT);
                setDraft(DEFAULT_CONTENT);
                setRaw(false);
                setToast("Возвращён исходный текст");
              }}
              title="Сбросить к исходному тексту"
              className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Icon path={ICONS.reset} />
            </button>
          </div>
        </div>

        {tocOpen ? (
          <div className="border-t border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
            <TableOfContents headings={headings} activeId={activeId} />
          </div>
        ) : null}
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 order-2 lg:order-1">
          {raw ? (
            <div className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
              <span className="font-medium">Режим правки.</span>
              <span className="text-indigo-700/80 dark:text-indigo-300/80">
                Вставьте свой текст (поддерживается Markdown), затем нажмите «Готово».
              </span>
              <button
                onClick={() => setRaw(false)}
                className="ml-auto rounded-lg px-2 py-1 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900"
              >
                Отмена
              </button>
            </div>
          ) : null}

          {raw ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              className="h-[70vh] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-[13px] leading-relaxed text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-indigo-900"
            />
          ) : (
            <article
              ref={articleRef}
              className="doc rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900/50"
              style={{ fontSize: `${prefs.fontSize}px` }}
            >
              <Markdown source={source} />
              <div className="no-print mt-10 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
                <button
                  onClick={copyAll}
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
                >
                  Скопировать весь текст
                </button>
                <button
                  onClick={download}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Скачать .md
                </button>
                <span className="text-slate-400">Ctrl/Cmd + F — поиск по тексту</span>
              </div>
            </article>
          )}
        </div>

        <aside className="no-print order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <div className="hidden lg:block">
              <TableOfContents headings={headings} activeId={activeId} />
            </div>
            <div className="mt-6 hidden rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500 lg:block dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Текст хранится только в этом браузере и никуда не отправляется.
            </div>
          </div>
        </aside>
      </main>

      {toast ? (
        <div className="no-print fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
