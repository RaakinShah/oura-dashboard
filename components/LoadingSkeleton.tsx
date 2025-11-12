export function CardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-8 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 bg-stone-200 rounded"></div>
        <div className="h-3 bg-stone-200 rounded w-20"></div>
      </div>
      <div className="h-10 bg-stone-200 rounded w-16 mb-3"></div>
      <div className="h-3 bg-stone-200 rounded w-32"></div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-stone-200 rounded-lg"></div>
          <div>
            <div className="h-3 bg-stone-200 rounded w-16 mb-2"></div>
            <div className="h-2 bg-stone-200 rounded w-12"></div>
          </div>
        </div>
        <div className="h-6 bg-stone-200 rounded-full w-20"></div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-4">
          <div className="h-14 bg-stone-200 rounded w-24"></div>
          <div className="h-8 bg-stone-200 rounded w-12"></div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-stone-200 rounded w-20"></div>
            <div className="h-3 bg-stone-200 rounded w-16"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 bg-stone-200 rounded w-24"></div>
            <div className="h-3 bg-stone-200 rounded w-14"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 bg-stone-200 rounded w-20"></div>
            <div className="h-3 bg-stone-200 rounded w-16"></div>
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-200 mb-4"></div>

      <div className="flex items-center justify-between">
        <div className="h-3 bg-stone-200 rounded w-24"></div>
        <div className="h-4 bg-stone-200 rounded w-12"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-12 animate-pulse">
      <div className="h-6 bg-stone-200 rounded w-48 mb-8"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 bg-stone-200 rounded w-16"></div>
            <div className="h-6 bg-stone-200 rounded flex-1" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-12 animate-pulse">
      <div className="flex items-start gap-6 mb-8">
        <div className="h-12 w-12 bg-stone-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-8 bg-stone-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-stone-200 rounded w-5/6"></div>
        </div>
      </div>
      <div className="bg-stone-100 border border-stone-200 rounded-lg p-8">
        <div className="h-3 bg-stone-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-6 w-6 bg-stone-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-stone-200 rounded w-full"></div>
                <div className="h-3 bg-stone-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-16">
      {/* Hero Section Skeleton */}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="h-16 bg-stone-200 rounded w-80 mb-3"></div>
            <div className="h-5 bg-stone-200 rounded w-48"></div>
          </div>
          <div className="h-10 bg-stone-200 rounded w-24"></div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      {/* AI Insight Skeleton */}
      <InsightCardSkeleton />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Navigation Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-lg p-8 animate-pulse">
            <div className="h-8 w-8 bg-stone-200 rounded mx-auto mb-4"></div>
            <div className="h-3 bg-stone-200 rounded w-16 mx-auto mb-2"></div>
            <div className="h-2 bg-stone-200 rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-lg p-4 flex items-center gap-4 animate-pulse">
          <div className="h-12 w-12 bg-stone-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
            <div className="h-3 bg-stone-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-stone-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-12 animate-pulse">
      <div className="h-12 bg-stone-200 rounded w-64 mb-3"></div>
      <div className="h-4 bg-stone-200 rounded w-96"></div>
    </div>
  );
}
