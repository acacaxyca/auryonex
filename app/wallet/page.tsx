"use client";

import { LazyWallet } from '@/components/LazyWallet';
import BottomNavigation from '@/components/BottomNavigation';

export default function WalletPage() {
  return (
    <>
      <LazyWallet />
      <BottomNavigation />
    </>
  );
}