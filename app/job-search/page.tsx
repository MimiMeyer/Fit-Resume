export default function JobSearchPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Job Search
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Scraping UI will be connected soon.
        </h1>
        <p className="text-sm text-zinc-600">
          Keyword inputs and scraped results will render here once hooked up to
          the database/scraper pipeline.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm text-zinc-700">
          No sample data shown. This page will query real scraped jobs when the
          scraper and persistence are wired up.
        </p>
      </section>
    </div>
  );
}
