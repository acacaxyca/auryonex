"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalletData } from '@/hooks/use-wallet-data';
import { WalletCache, CACHE_KEYS } from '@/lib/wallet-cache';
import { WalletNetworkError } from './WalletErrorBoundary';
import { WalletHeaderSkeleton, WalletActionsSkeleton, WalletListSkeleton } from './WalletSkeleton';
import { useRouter } from 'next/navigation';

const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' }
} as const;

export function WalletPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('USD');
  
  const {
    coins,
    balanceData,
    priceData,
    p24hData,
    isLoading,
    error,
    retryDataFetch
  } = useWalletData();

  // Load currency setting from localStorage
  useEffect(() => {
    const savedCurrency = WalletCache.get<'USD' | 'IDR'>(CACHE_KEYS.CURRENCY);
    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'IDR')) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency setting to localStorage
  const handleCurrencyChange = useCallback((newCurrency: 'USD' | 'IDR') => {
    setCurrency(newCurrency);
    WalletCache.set(CACHE_KEYS.CURRENCY, newCurrency);
  }, []);

  // Memoized calculations for performance
  const calculations = useMemo(() => {
    const calculateTotalAssets = () => {
      let total = 0;
      coins.forEach(coin => {
        const balance = balanceData[coin.symbol] || 0;
        const price = priceData[coin.coin_id] || 0;
        total += balance * price;
      });
      return total;
    };

    const calculatePNLToday = () => {
      let totalCurrentValue = 0;
      let totalPreviousValue = 0;
      
      coins.forEach(coin => {
        const balance = balanceData[coin.symbol] || 0;
        const currentPrice = priceData[coin.coin_id] || 0;
        const p24h = p24hData[coin.coin_id] || 0;
        
        const previousPrice = currentPrice / (1 + p24h / 100);
        
        totalCurrentValue += balance * currentPrice;
        totalPreviousValue += balance * previousPrice;
      });
      
      if (totalPreviousValue === 0) return { percentage: 0, isPositive: true };
      
      const pnlPercentage = ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100;
      return {
        percentage: Math.abs(pnlPercentage),
        isPositive: pnlPercentage >= 0
      };
    };

    const getSortedCoins = () => {
      return [...coins].sort((a, b) => {
        const balanceA = balanceData[a.symbol] || 0;
        const priceA = priceData[a.coin_id] || 0;
        const totalValueA = balanceA * priceA;
        
        const balanceB = balanceData[b.symbol] || 0;
        const priceB = priceData[b.coin_id] || 0;
        const totalValueB = balanceB * priceB;
        
        return totalValueB - totalValueA;
      });
    };

    return {
      totalAssets: calculateTotalAssets(),
      pnlToday: calculatePNLToday(),
      sortedCoins: getSortedCoins()
    };
  }, [coins, balanceData, priceData, p24hData]);

  // Memoized formatters
  const formatters = useMemo(() => {
    const formatCurrency = (amount: number) => {
      const currencyInfo = CURRENCIES[currency];
      if (currency === 'IDR') {
        return `${currencyInfo.symbol}${(amount * 15000).toLocaleString('id-ID')}`;
      }
      return `${currencyInfo.symbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    };

    const formatPrice = (price: number) => {
      const currencyInfo = CURRENCIES[currency];
      if (currency === 'IDR') {
        return `${currencyInfo.symbol}${(price * 15000).toLocaleString('id-ID')}`;
      }
      return `${currencyInfo.symbol}${price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    };

    const formatP24h = (p24h: number) => {
      const percentage = p24h.toFixed(2);
      const numPercentage = parseFloat(percentage);
      
      if (numPercentage === 0) {
        return `0.00%`;
      }
      
      const sign = numPercentage > 0 ? '+' : '';
      return `${sign}${percentage}%`;
    };

    const getP24hColor = (p24h: number) => {
      const numPercentage = parseFloat(p24h.toFixed(2));
      
      if (numPercentage === 0) {
        return 'text-gray-500 dark:text-gray-400';
      }
      
      return numPercentage > 0 ? 'text-green-500' : 'text-red-500';
    };

    return { formatCurrency, formatPrice, formatP24h, getP24hColor };
  }, [currency]);

  // Show error state with cached data if available
  if (error && coins.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 pb-24">
          <WalletNetworkError 
            onRetry={retryDataFetch}
            message="Unable to load wallet data. Please check your connection and try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Assets and PNL Section */}
        {isLoading ? (
          <WalletHeaderSkeleton />
        ) : (
          <div className="text-center mb-8">
            <div className="mb-2">
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
                {formatters.formatCurrency(calculations.totalAssets)}
              </h2>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className={cn(
                "text-lg font-bold",
                calculations.pnlToday.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {calculations.pnlToday.isPositive ? '+' : '-'}
                {calculations.pnlToday.percentage.toFixed(2)}% Today
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isLoading ? (
          <WalletActionsSkeleton />
        ) : (
          <div className="flex justify-center space-x-8 mb-12">
            <button className="group relative">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Send</span>
            </button>
            
            <button 
              className="group relative"
              onClick={() => router.push('/receive')}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                <ArrowDownLeft className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Receive</span>
            </button>
            
            <button className="group relative">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">History</span>
            </button>
          </div>
        )}

        {/* Coin List */}
        {isLoading ? (
          <WalletListSkeleton />
        ) : (
          <div className="space-y-3">
            {calculations.sortedCoins.map((coin) => {
              const balance = balanceData[coin.symbol] || 0;
              const price = priceData[coin.coin_id] || 0;
              const p24h = p24hData[coin.coin_id] || 0;
              const totalValue = balance * price;
              
              return (
                <div
                  key={coin.coin_id}
                  className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={coin.icon}
                        alt={coin.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/40/3B82F6/FFFFFF?text=${coin.symbol}`;
                        }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{coin.symbol}</h4>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatters.formatPrice(price)}
                          </p>
                          <span className={cn(
                            "text-xs font-medium",
                            formatters.getP24hColor(p24h)
                          )}>
                            {formatters.formatP24h(p24h)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {balance.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatters.formatCurrency(totalValue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!isLoading && coins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No assets found</p>
          </div>
        )}
      </div>
    </div>
  );
}