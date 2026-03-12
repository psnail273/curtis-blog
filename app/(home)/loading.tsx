export default function Loading() {
  return (
    <div className="pt-4 md:pt-6 animate-pulse flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap)]">
      {/* Hero mosaic skeleton — matches HeroMosaic 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Hero card (2x2) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-border rounded-lg h-64 md:h-[400px]" />
        {/* Side cards */}
        <div className="bg-border rounded-lg h-48" />
        <div className="bg-border rounded-lg h-48" />
      </div>

      <hr className="editorial-rule" />

      {/* Category sections — matches CategoryArticles layout */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="w-full flex flex-col gap-4 md:gap-5">
          {/* Category header */}
          <div className="flex items-center gap-0">
            <div className="w-[3px] h-5 bg-border rounded-full" />
            <div className="h-4 w-24 bg-border rounded ml-3" />
          </div>
          {/* 2-column layout: featured left + stacked cards right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Featured card (left) */}
            <div className="bg-border rounded-lg h-64 md:h-full min-h-[320px]" />
            {/* Stacked cards (right) */}
            <div className="flex flex-col gap-4 md:gap-5">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex flex-col sm:flex-row border border-border rounded-lg overflow-hidden h-32">
                  <div className="w-full sm:w-48 md:w-56 bg-border shrink-0 h-full" />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-3 w-16 bg-border rounded" />
                    <div className="h-5 w-3/4 bg-border rounded" />
                    <div className="h-3 w-1/2 bg-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {i < 1 && <hr className="editorial-rule" />}
        </div>
      ))}
    </div>
  );
}
