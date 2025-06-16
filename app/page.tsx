"use client";

import BottomNavigation from '@/components/BottomNavigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main content area */}
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            aca jelek
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            This is a demo of a beautiful bottom navigation bar with smooth animations, 
            gradient effects, and modern design principles. Try tapping the different 
            navigation items to see the elegant transitions.
          </p>
          
          {/* Demo cards */}
          <div className="grid gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h2>
              <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Smooth scale-up animations on active state</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Sliding indicator with gradient background</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Ripple effects on tap interactions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Glassmorphism design with backdrop blur</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Dark mode support with smooth transitions</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Navigation Items
              </h2>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">🏠</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Home</span>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">📈</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Market</span>
                </div>
                <div className="space-y-2">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-white text-sm font-medium">⇄</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Swap</span>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">🪙</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stake</span>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">👛</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}