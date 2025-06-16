import React from 'react';

export function WalletHeaderSkeleton() {
  return (
    <div className="text-center mb-8 animate-pulse">
      <div className="mb-2">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-2"></div>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
}

export function WalletActionsSkeleton() {
  return (
    <div className="flex justify-center space-x-8 mb-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="group relative animate-pulse">
          <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        </div>
      ))}
    </div>
  );
}

export function WalletCoinSkeleton() {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function WalletListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <WalletCoinSkeleton key={i} />
      ))}
    </div>
  );
}

export function WalletPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 pb-24">
        <WalletHeaderSkeleton />
        <WalletActionsSkeleton />
        <WalletListSkeleton />
      </div>
    </div>
  );
}