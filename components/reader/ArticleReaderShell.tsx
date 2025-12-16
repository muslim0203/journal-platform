"use client";

import { useState } from "react";
import { PdfReader } from "@/components/reader/PdfReader";
import { MetadataSidebar } from "@/components/reader/MetadataSidebar";
import { CitationPanel } from "@/components/reader/CitationPanel";
import { MobileBottomSheet } from "@/components/reader/MobileBottomSheet";
import type { Article } from "@/lib/mockArticles";

type Props = {
  article: Article;
};

export function ArticleReaderShell({ article }: Props) {
  const [showCitation, setShowCitation] = useState(false);
  const [mobileMetaOpen, setMobileMetaOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 xl:grid-cols-[1fr_360px_1fr]">
        <main className="lg:col-span-2 flex flex-col gap-4">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{article.title}</h1>
              <p className="text-sm text-neutral-600">
                {article.journal} · {article.year} ·{" "}
                {article.authors.map((a) => a.fullName).join(", ")}
              </p>
              <p className="text-xs text-neutral-500">Sahifa: {currentPage}</p>
            </div>
            <div className="flex gap-2 lg:hidden">
              <button
                onClick={() => setMobileMetaOpen(true)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-neutral-700"
              >
                Metadata
              </button>
              <button
                onClick={() => setShowCitation(true)}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Iqtibos
              </button>
            </div>
          </header>

          {article.pdfUrl ? (
            <PdfReader
              pdfUrl={article.pdfUrl}
              initialPage={1}
              onPageChange={setCurrentPage}
            />
          ) : (
            <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300">
              Ushbu maqola uchun to‘g‘ridan-to‘g‘ri PDF manzili topilmadi.
            </div>
          )}

          {showCitation && (
            <CitationPanel article={article} onClose={() => setShowCitation(false)} />
          )}
        </main>

        <div className="hidden xl:block" />
        <div className="hidden lg:block">
          <MetadataSidebar article={article} onOpenCitation={() => setShowCitation(true)} />
        </div>
      </div>

      <MobileBottomSheet open={mobileMetaOpen} onClose={() => setMobileMetaOpen(false)}>
        <MetadataSidebar
          article={article}
          onOpenCitation={() => {
            setShowCitation(true);
            setMobileMetaOpen(false);
          }}
        />
      </MobileBottomSheet>
    </div>
  );
}



