export function Loading() {
  return (
    <div className="space-y-8">
      {/* Search bar skeleton */}
      <div className="h-10 bg-muted rounded-md animate-pulse" />

      {/* Category navigation skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-md animate-pulse shrink-0" />
        ))}
      </div>

      {/* Menu items skeleton */}
      {[1, 2, 3].map((category) => (
        <div key={category} className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-20 h-20 bg-muted rounded-md animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded-md animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-muted rounded-md animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}