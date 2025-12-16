"use client";

import { useMemo, useState } from "react";

type Article = {
  title: string;
  authors: { fullName: string }[];
  journal: string;
  year: number;
  doi?: string;
};

type Props = {
  article: Article;
  onClose?: () => void;
};

const styles: Array<"APA" | "MLA" | "Chicago" | "GOST"> = ["APA", "MLA", "Chicago", "GOST"];

const formatAuthors = (authors: Article["authors"]) =>
  authors.map((a) => a.fullName).join(", ");

const buildCitation = (article: Article, style: (typeof styles)[number]) => {
  const authors = formatAuthors(article.authors);
  const year = article.year;
  const title = article.title;
  const journal = article.journal;
  const doi = article.doi ? `https://doi.org/${article.doi.replace(/^https?:\/\/doi.org\//, "")}` : "";
  switch (style) {
    case "APA":
      return `${authors} (${year}). ${title}. ${journal}. ${doi}`.trim();
    case "MLA":
      return `${authors}. "${title}." ${journal}, ${year}. ${doi}`.trim();
    case "Chicago":
      return `${authors}. "${title}." ${journal} (${year}). ${doi}`.trim();
    case "GOST":
      return `${authors}. ${title} // ${journal}. ${year}. ${doi}`.trim();
  }
};

export function CitationPanel({ article, onClose }: Props) {
  const [style, setStyle] = useState<(typeof styles)[number]>("APA");
  const citation = useMemo(() => buildCitation(article, style), [article, style]);

  const copy = async () => {
    await navigator.clipboard.writeText(citation);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Iqtibos</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Yopish
          </button>
        )}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {styles.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              s === style
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-800">
        {citation}
      </div>
      <div className="mt-3">
        <button
          onClick={copy}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Nusxalash
        </button>
      </div>
    </div>
  );
}


