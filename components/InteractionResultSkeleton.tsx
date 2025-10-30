import React from 'react';
import { InfoIcon, ClipboardListIcon, NoteIcon } from './Icons';

export const InteractionResultSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-fade-in print:hidden">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="ml-4 w-full">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mt-2"></div>
          </div>
        </div>

        {/* Section Skeleton */}
        <div className="mt-8">
          <div className="flex items-center">
            <InfoIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 ml-2"></div>
          </div>
          <div className="pl-8 mt-2 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>

        {/* Section Skeleton */}
        <div className="mt-6">
          <div className="flex items-center">
            <ClipboardListIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-56 ml-2"></div>
          </div>
          <div className="pl-8 mt-2 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
        
        {/* Section Skeleton */}
        <div className="mt-6">
          <div className="flex items-center">
            <NoteIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 ml-2"></div>
          </div>
          <div className="pl-8 mt-2 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
