"use client";

import React, { Suspense, lazy, useEffect } from 'react';
import { WalletPageSkeleton } from './WalletSkeleton';
import { WalletErrorBoundary } from './WalletErrorBoundary';
import { QRCodeManager } from '@/lib/qr-generator';

// Lazy load the wallet component with preloading
const WalletPageComponent = lazy(() => 
  import('./WalletPage').then(module => ({ default: module.WalletPage }))
);

// Preload the wallet component during idle time
let preloadPromise: Promise<any> | null = null;

export function preloadWalletPage() {
  if (!preloadPromise) {
    preloadPromise = import('./WalletPage');
  }
  return preloadPromise;
}

export function LazyWallet() {
  // Preload during idle time
  useEffect(() => {
    const preloadTasks = async () => {
      // Preload wallet component
      if ('requestIdleCallback' in window) {
        const idleCallback = window.requestIdleCallback(() => {
          preloadWalletPage();
        });
        
        return () => window.cancelIdleCallback(idleCallback);
      } else {
        // Fallback for browsers without requestIdleCallback
        const timeout = setTimeout(() => {
          preloadWalletPage();
        }, 100);
        
        return () => clearTimeout(timeout);
      }
    };

    const cleanup = preloadTasks();
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return (
    <WalletErrorBoundary>
      <Suspense fallback={<WalletPageSkeleton />}>
        <WalletPageComponent />
      </Suspense>
    </WalletErrorBoundary>
  );
}