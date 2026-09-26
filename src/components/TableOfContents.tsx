import type { Heading } from "../lib/markdown";

export default function TableOfContents({
  headings,
  activeId,
}: {
  headings: Heading[];
  activeId: string | null;
}) {
  return (
    <nav aria-label="Оглавление" className="no-print text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Оглавление
      </p>
      <ul className="space-y-1 border-l border-slate-200 dark:border-slate-800">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={[
                  "-ml-px block border-l-2 py-1 pr-2 leading-snug transition-colors",
                  h.level === 1 ? "pl-3 font-semibold" : h.level === 2 ? "pl-5" : "pl-7 text-[0.9em]",
                  active
                    ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                ].join(" ")}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
