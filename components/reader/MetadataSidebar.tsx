"use client";

type Article = {
  title: string;
  authors: { fullName: string; affiliation?: string }[];
  journal: string;
  year: number;
  doi?: string;
  topics: string[];
  abstract: string;
};

type Props = {
  article: Article;
  onOpenCitation: () => void;
};

export function MetadataSidebar({ article, onOpenCitation }: Props) {
  return (
    <aside className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col gap-4 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h2 className="text-lg font-semibold">{article.title}</h2>
        <p className="text-sm text-neutral-600">
          {article.journal} · {article.year}
        </p>
        {article.doi && (
          <a
            href={`https://doi.org/${article.doi.replace(/^https?:\/\/doi.org\//, "")}`}
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            DOI: {article.doi}
          </a>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold">Mualliflar</h3>
        <ul className="text-sm text-neutral-700 dark:text-neutral-200">
          {article.authors.map((a) => (
            <li key={a.fullName}>
              {a.fullName}
              {a.affiliation ? ` — ${a.affiliation}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Mavzular</h3>
        <div className="flex flex-wrap gap-2">
          {article.topics.map((t) => (
            <span
              key={t}
              className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Annotatsiya</h3>
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
          {article.abstract}
        </p>
      </div>

      <button
        onClick={onOpenCitation}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Iqtibos olish
      </button>
    </aside>
  );
}


