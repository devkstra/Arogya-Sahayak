"use client";

import { Card } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <Card className="p-4 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </Card>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start animate-pulse">
      <div className="max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoConferenceSkeleton() {
  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex ${
            i % 2 === 0 ? "justify-end" : "justify-start"
          } animate-pulse`}
        >
          <div
            className={`max-w-xs p-3 rounded-lg ${
              i % 2 === 0 ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
