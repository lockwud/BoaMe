/**
 * SkeletonStats Component
 * 
 * Displays skeleton loading placeholders for admin dashboard statistics.
 * Shows animated placeholder cards while data is being fetched.
 * 
 * @component
 * @example
 * <SkeletonStats />
 */
"use client";

/**
 * SkeletonStats component
 * Renders skeleton loaders for overview statistics
 */
export function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div 
          key={index} 
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Skeleton for label */}
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              {/* Skeleton for value */}
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            {/* Skeleton for icon */}
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
          </div>
          {/* Skeleton for detail */}
          <div className="mt-3 h-3 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
