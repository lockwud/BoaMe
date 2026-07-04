 /**
 * SkeletonPanel Component
 * 
 * Displays skeleton loading placeholders for admin dashboard panels.
 * Shows animated placeholder content while data is being fetched.
 * 
 * @component
 * @example
 * <SkeletonPanel />
 */
"use client";

/**
 * SkeletonPanel component
 * Renders skeleton loaders for admin dashboard sections
 */
export function SkeletonPanel() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
        <div className="flex-1">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-3 w-48 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      {/* Content skeletons */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div 
            key={index} 
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
