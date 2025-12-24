type ToolbarProps = {
  viewMode: "edit" | "preview";
  layoutMode: "single" | "two";
  setLayoutMode: (mode: "single" | "two") => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  zoomPercent: number;
  zoomStep: number;
  onZoomChange: (next: number) => void;
  onDownloadPdf: () => void;
  pdfGenerating: boolean;
  pdfError: string | null;
  onShowJd?: () => void;
};

const accentOptions = [
  { name: "Gray", value: "#808080" },
  { name: "Teal", value: "#008080" },
  { name: "Blue", value: "#2563eb" },
  { name: "Pink", value: "#ff8a9d" },
  { name: "Green", value: "#90ee90" },
  { name: "None", value: "#ffffff" },
];

export function Toolbar({
  viewMode,
  layoutMode,
  setLayoutMode,
  accentColor,
  setAccentColor,
  zoomPercent,
  zoomStep,
  onZoomChange,
  onDownloadPdf,
  pdfGenerating,
  pdfError,
  onShowJd,
}: ToolbarProps) {
  return (
    <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 overflow-visible">
      <div className="flex flex-wrap items-center gap-2">
        {onShowJd ? (
          <button
            onClick={onShowJd}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-sm transition hover:border-[var(--accent)]"
          >
            Show job description
          </button>
        ) : null}
        {viewMode === "edit" && (
          <>
            <div className="flex items-center gap-2 text-[11px] text-zinc-700">
              {accentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAccentColor(opt.value)}
                  className="relative h-5 w-5 rounded-full border border-zinc-300"
                  style={{
                    backgroundColor: opt.value,
                    boxShadow:
                      accentColor === opt.value
                        ? opt.value.toLowerCase() === "#ffffff"
                          ? "0 0 0 3px rgba(0,0,0,0.08)"
                          : `0 0 0 3px ${opt.value}33`
                        : undefined,
                  }}
                  aria-label={`Use ${opt.name} accent`}
                  title={opt.name}
                >
                  {opt.value.toLowerCase() === "#ffffff" ? (
                    <span
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      style={{ width: "100%", height: "100%", transform: "rotate(-20deg)" }}
                    >
                      <span aria-hidden style={{ width: "120%", height: "2px", background: "#6b7280", display: "block" }} />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 text-[11px] font-semibold text-zinc-700">
              <button
                onClick={() => setLayoutMode("single")}
                className={`rounded-full px-3 py-1 transition ${
                  layoutMode === "single" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:bg-white/70"
                }`}
              >
                1 column
              </button>
              <button
                onClick={() => setLayoutMode("two")}
                className={`rounded-full px-3 py-1 transition ${
                  layoutMode === "two" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:bg-white/70"
                }`}
              >
                2 columns
              </button>
            </div>
          </>
        )}
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-700">
          <button
            aria-label="Zoom out"
            onClick={() => onZoomChange(zoomPercent - zoomStep * 100)}
            className="rounded-full px-2 py-1 transition hover:bg-white"
          >
            -
          </button>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">Zoom</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-zinc-900 shadow-sm">{zoomPercent}%</span>
          </div>
          <button
            aria-label="Zoom in"
            onClick={() => onZoomChange(zoomPercent + zoomStep * 100)}
            className="rounded-full px-2 py-1 transition hover:bg-white"
          >
            +
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={300}
            step={zoomStep * 100}
            value={zoomPercent}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="h-1 w-32 accent-[var(--accent)]"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={pdfGenerating}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pdfGenerating ? "Preparing PDF..." : "Download PDF"}
      </button>
      {pdfError ? <p className="text-[11px] text-red-600">{pdfError}</p> : null}
    </div>
  );
}
