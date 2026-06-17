export default function ArticleLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 bg-border rounded mb-8" />

      {/* Cover image */}
      <div className="w-full aspect-[16/9] bg-border rounded-lg mb-8 md:mb-12" />

      {/* Header */}
      <div className="mb-8 md:mb-12">
        {/* Title */}
        <div className="space-y-3 mb-5 md:mb-6">
          <div className="h-8 md:h-10 w-full bg-border rounded" />
          <div className="h-8 md:h-10 w-3/4 bg-border rounded" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2 mb-6 md:mb-8">
          <div className="h-5 w-full bg-border rounded" />
          <div className="h-5 w-5/6 bg-border rounded" />
        </div>

        {/* Byline */}
        <div className="pt-5 border-t border-border">
          <div className="h-4 w-32 bg-border rounded mb-1.5" />
          <div className="h-3 w-44 bg-border rounded" />
        </div>
      </div>

      {/* Article body */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-11/12 bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-4/5 bg-border rounded" />

        <div className="h-6 my-2" /> {/* Paragraph gap */}

        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-3/4 bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-5/6 bg-border rounded" />
      </div>
    </div>
  );
}
