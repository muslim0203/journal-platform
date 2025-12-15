"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
  pdfUrl: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  useIframeFallback?: boolean;
};

export function PdfReader({ pdfUrl, initialPage = 1, onPageChange, useIframeFallback }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageWidth, setPageWidth] = useState<number>(900);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    setPageWidth(Math.min(w, 980));
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const pages = useMemo(() => {
    if (!numPages) return null;
    return Array.from({ length: numPages }, (_, idx) => idx + 1);
  }, [numPages]);

  const handlePageRender = useCallback(
    (page: number) => {
      if (page !== currentPage) {
        setCurrentPage(page);
        onPageChange?.(page);
      }
    },
    [currentPage, onPageChange]
  );

  if (useIframeFallback || loadError) {
    return (
      <div className="flex flex-col gap-3">
        {loadError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            PDF yuklashda xatolik. Iframe ko‘rinishi.
          </div>
        )}
        <iframe
          title="PDF viewer"
          src={pdfUrl}
          className="h-[80vh] w-full rounded border border-neutral-200"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
        <span className="tabular-nums">
          Sahifalar: {numPages ? numPages : "…"}
        </span>
        <span className="tabular-nums">Joriy: {currentPage}</span>
      </div>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(e) => setLoadError(e as Error)}
        className="flex flex-col items-center gap-6"
        loading={<div className="py-6 text-sm text-neutral-500">Yuklanmoqda…</div>}
      >
        {pages?.map((p) => (
          <Page
            key={p}
            pageNumber={p}
            width={pageWidth}
            className="shadow-md"
            onRenderSuccess={() => handlePageRender(p)}
          />
        ))}
      </Document>
    </div>
  );
}

