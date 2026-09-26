import { Fragment, useState, type ReactNode } from "react";
import { parseBlocks, splitInline, inlineKind, type Block } from "../lib/markdown";

function Inline({ text }: { text: string }) {
  return (
    <>
      {splitInline(text).map((part, i) => {
        const t = inlineKind(part);
        if (t.kind === "code")
          return (
            <code
              key={i}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.88em] text-pink-600 dark:bg-slate-800 dark:text-pink-300"
            >
              {t.value}
            </code>
          );
        if (t.kind === "strong")
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
              {t.value}
            </strong>
          );
        if (t.kind === "em")
          return (
            <em key={i} className="italic">
              {t.value}
            </em>
          );
        if (t.kind === "link")
          return (
            <a
              key={i}
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-600 dark:text-indigo-400"
            >
              {t.value}
            </a>
          );
        return <Fragment key={i}>{t.value}</Fragment>;
      })}
    </>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="group relative mb-5">
      <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 pr-20 font-mono text-[0.85em] leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2">
        {lang ? (
          <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wide text-slate-400">
            {lang}
          </span>
        ) : null}
        <button
          onClick={copy}
          className="no-print pointer-events-auto rounded-md bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-300 opacity-0 transition hover:bg-slate-700 hover:text-white group-hover:opacity-100"
        >
          {copied ? "✓ Скопировано" : "Копировать"}
        </button>
      </div>
    </div>
  );
}

function renderBlock(block: Block, i: number): ReactNode {
  switch (block.type) {
    case "heading": {
      const Tag = (["h1", "h2", "h3", "h4", "h5", "h6"][block.level - 1] ?? "h3") as "h1";
      const styles: Record<number, string> = {
        1: "mb-4 text-[1.9em] font-bold leading-tight tracking-tight text-slate-900 dark:text-white",
        2: "mb-3 mt-10 border-b border-slate-200 pb-2 text-[1.4em] font-semibold tracking-tight text-slate-900 dark:border-slate-800 dark:text-white",
        3: "mb-2 mt-8 text-[1.16em] font-semibold text-slate-900 dark:text-slate-100",
        4: "mb-2 mt-6 text-[1.03em] font-semibold text-slate-900 dark:text-slate-100",
      };
      return (
        <Tag key={i} id={block.id} className={styles[block.level] ?? styles[4]}>
          <Inline text={block.text} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={i} className="mb-4 leading-[1.78] text-slate-700 dark:text-slate-300">
          <Inline text={block.text} />
        </p>
      );
    case "code":
      return <CodeBlock key={i} code={block.text} lang={block.lang} />;
    case "ul":
      return (
        <ul
          key={i}
          className="mb-5 list-disc space-y-1.5 pl-6 leading-[1.7] text-slate-700 marker:text-indigo-400 dark:text-slate-300"
        >
          {block.items.map((it, k) => (
            <li key={k}>
              <Inline text={it} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={i}
          className="mb-5 list-decimal space-y-1.5 pl-6 leading-[1.7] text-slate-700 marker:font-semibold marker:text-indigo-500 dark:text-slate-300"
        >
          {block.items.map((it, k) => (
            <li key={k}>
              <Inline text={it} />
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="mb-5 rounded-r-lg border-l-4 border-indigo-400 bg-indigo-50/60 py-3 pl-4 pr-3 leading-[1.7] text-slate-700 dark:bg-indigo-950/30 dark:text-slate-300"
        >
          {block.lines.map((l, k) => (
            <p key={k}>
              <Inline text={l} />
            </p>
          ))}
        </blockquote>
      );
    case "table":
      return (
        <div key={i} className="mb-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-[0.94em]">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                {block.header.map((h, k) => (
                  <th
                    key={k}
                    className="border-b border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100"
                  >
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="even:bg-slate-50/60 dark:even:bg-slate-900/40">
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className="border-b border-slate-100 px-4 py-2.5 align-top text-slate-700 last:border-0 dark:border-slate-800/60 dark:text-slate-300"
                    >
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "hr":
      return <hr key={i} className="my-8 border-slate-200 dark:border-slate-800" />;
    default:
      return null;
  }
}

export default function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return <>{blocks.map((b, i) => renderBlock(b, i))}</>;
}
