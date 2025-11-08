export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow-sm">
      <div className="space-y-4">
        <div className="skeleton h-6 w-32"></div>
        <div className="skeleton h-12 w-24"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-3/4"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 card-shadow-md">
      <div className="skeleton h-6 w-48 mb-6"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-4 w-16"></div>
            <div className="skeleton h-8 flex-1" style={{ height: `${Math.random() * 40 + 20}px` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl p-6 card-shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="skeleton h-7 w-7 rounded-lg"></div>
        <div className="flex-1">
          <div className="skeleton h-6 w-3/4 mb-3"></div>
          <div className="skeleton h-4 w-full mb-2"></div>
          <div className="skeleton h-4 w-5/6"></div>
        </div>
      </div>
      <div className="skeleton h-24 w-full rounded-xl mt-4"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header skeleton */}
      <div className="animate-fade-in">
        <div className="skeleton h-10 w-64 mb-2"></div>
        <div className="skeleton h-5 w-96"></div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Insights skeleton */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <InsightCardSkeleton />
        <InsightCardSkeleton />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 card-shadow-sm flex items-center gap-4">
          <div className="skeleton h-12 w-12 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4"></div>
            <div className="skeleton h-4 w-1/2"></div>
          </div>
          <div className="skeleton h-8 w-20 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}
