"use client";

import { useEffect, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type RenderTask,
} from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type PdfPreviewerProps = {
  file: string;
  initialScale?: number;
};

export function PdfPreviewer({ file, initialScale = 1 }: PdfPreviewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(initialScale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let mounted = true;
    setError(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const src =
      typeof window !== "undefined" ? new URL(file, window.location.origin).toString() : file;

    getDocument(src)
      .promise.then((doc) => {
        if (!mounted) {
          doc.destroy();
          return;
        }
        setPdf(doc);
        setNumPages(doc.numPages);
        setPageNumber(1);
      })
      .catch((err) => {
        console.error("Failed to load PDF", err);
        if (mounted) setError("Unable to load PDF preview.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      renderTaskRef.current?.cancel();
      setPdf((doc) => {
        doc?.destroy();
        return null;
      });
    };
  }, [file]);

  useEffect(() => {
    if (!pdf) return;

    let cancelled = false;
    const renderPage = async (pageNum: number, nextScale: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      try {
        const page: PDFPageProxy = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: nextScale });

        const outputScale = window.devicePixelRatio || 1;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        renderTaskRef.current?.cancel();
        const task = page.render({
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: unknown) {
        const renderError = err as { name?: string };
        if (renderError?.name !== "RenderingCancelledException") {
          console.error("Render error", err);
        }
      }
    };

    renderPage(pageNumber, scale);

    return () => {
      cancelled = true;
      if (cancelled) renderTaskRef.current?.cancel();
    };
  }, [pageNumber, pdf, scale]);

  const handlePrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const handleNext = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const handleZoomIn = () => setScale((s) => Math.min(3, parseFloat((s + 0.2).toFixed(1))));
  const handleZoomOut = () => setScale((s) => Math.max(0.5, parseFloat((s - 0.2).toFixed(1))));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="font-semibold text-zinc-800">PDF Preview</span>
          {loading && <span className="text-[10px] uppercase tracking-[0.14em]">Loading...</span>}
          {error && <span className="text-[10px] text-red-600">{error}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={handlePrev}
            disabled={pageNumber <= 1}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={pageNumber >= numPages}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
          <span className="mx-2 text-[11px] text-zinc-600">
            Page {pageNumber} / {numPages || "?"}
          </span>
          <button
            onClick={handleZoomOut}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            -
          </button>
          <span className="min-w-[50px] text-center text-[11px] text-zinc-700">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            +
          </button>
          <button
            onClick={handleResetZoom}
            className="ml-1 rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2">
        <canvas ref={canvasRef} className="mx-auto block bg-white shadow-sm" />
        {!pdf && !loading && !error ? (
          <div className="py-10 text-center text-sm text-zinc-600">Load a PDF to preview.</div>
        ) : null}
      </div>
    </div>
  );
}
