"use client";

import React, { useState } from 'react';
import { Home, TrendingUp, ArrowLeftRight, Coins, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'market', icon: TrendingUp, label: 'Market', path: '/market' },
  { id: 'swap', icon: ArrowLeftRight, label: 'Swap', path: '/swap', isCenter: true },
  { id: 'stake', icon: Coins, label: 'Stake', path: '/stake' },
  { id: 'wallet', icon: Wallet, label: 'Wallet', path: '/wallet' },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active item based on current path
  const getActiveItem = () => {
    // If we're on the receive page, keep wallet active
    if (pathname === '/receive') {
      return 'wallet';
    }
    
    const activeNav = navItems.find(item => item.path === pathname);
    return activeNav?.id || 'home';
  };
  
  const activeItem = getActiveItem();

  const getIndicatorPosition = () => {
    const activeIndex = navItems.findIndex(item => item.id === activeItem);
    const itemWidth = 100 / navItems.length; // 20% for each item
    return activeIndex * itemWidth + itemWidth / 2; // Center position of active item
  };

  const handleNavClick = (item: NavItem) => {
    // Only allow navigation if it's not the currently active item
    if (item.id !== activeItem) {
      router.push(item.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="relative max-w-md mx-auto px-2 py-2">
        {/* Sliding indicator - positioned precisely */}
        <div 
          className="absolute top-2 h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 transition-all duration-300 ease-out"
          style={{
            left: `${getIndicatorPosition()}%`,
            transform: 'translateX(-50%)',
          }}
        />
        
        {/* Navigation items */}
        <div className="flex items-center justify-between relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                disabled={isActive}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ease-out group relative flex-1",
                  isActive 
                    ? "transform scale-110 cursor-default" 
                    : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer"
                )}
              >
                {/* Icon container with glow effect */}
                <div className={cn(
                  "relative p-2 rounded-xl transition-all duration-300 ease-out",
                  isActive && "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
                )}>
                  <Icon 
                    className={cn(
                      "transition-all duration-300 ease-out",
                      item.isCenter ? "w-7 h-7" : "w-6 h-6",
                      isActive 
                        ? "text-white" 
                        : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                    )}
                  />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-300 ease-out",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 font-semibold" 
                    : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                )}>
                  {item.label}
                </span>
                
                {/* Ripple effect on tap - only for non-active items */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl transform scale-0 transition-transform duration-200 ease-out",
                      "group-active:scale-100"
                    )} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Bottom safe area for devices with home indicator */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}