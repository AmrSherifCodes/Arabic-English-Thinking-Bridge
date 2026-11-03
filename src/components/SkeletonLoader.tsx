import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-2/70 border border-border/40 ${className}`}
      aria-hidden="true"
    />
  );
}

export function LessonCardSkeleton() {
  return (
    <div className="p-4 rounded-3xl bg-surface border border-border/60 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-4 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-3/4 rounded-xl" />
      <Skeleton className="h-3 w-1/2 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
