"use client";

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalletData } from '@/hooks/use-wallet-data';
import { useWalletContext } from '@/components/WalletProvider';
import { useRouter } from 'next/navigation';
import { QRCodeManager } from '@/lib/qr-generator';

export function ReceivePage() {
  const router = useRouter();
  const { coins } = useWalletData();
  const { walletAddresses, isInitialized, isLoading: walletLoading } = useWalletContext();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ERC20');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [qrCodesReady, setQrCodesReady] = useState(false);

  // Get the specific coins we want to show (USDT, BTC, ETH)
  const getDisplayCoins = () => {
    const targetSymbols = ['USDT', 'BTC', 'ETH'];
    return targetSymbols.map(symbol => {
      const coin = coins.find(c => c.symbol === symbol);
      if (coin) {
        return {
          ...coin,
          networks: symbol === 'USDT' ? ['ERC20', 'TRC20'] : undefined
        };
      }
      // Fallback if coin not found in API
      return {
        coin_id: symbol.toLowerCase(),
        symbol,
        name: symbol === 'USDT' ? 'Tether USD' : symbol === 'BTC' ? 'Bitcoin' : 'Ethereum',
        icon: `https://via.placeholder.com/48/3B82F6/FFFFFF?text=${symbol}`,
        networks: symbol === 'USDT' ? ['ERC20', 'TRC20'] : undefined
      };
    });
  };

  // Preload QR codes when addresses are available
  useEffect(() => {
    if (walletAddresses && isInitialized && !qrCodesReady) {
      preloadQRCodes();
    }
  }, [walletAddresses, isInitialized, qrCodesReady]);

  const preloadQRCodes = async () => {
    if (!walletAddresses) return;
    
    try {
      console.log('Preloading QR codes for all addresses...');
      await QRCodeManager.initialize(walletAddresses);
      setQrCodesReady(true);
      console.log('QR codes preloaded successfully');
    } catch (error) {
      console.error('Failed to preload QR codes:', error);
      setQrCodesReady(true); // Continue anyway
    }
  };

  const getCurrentAddress = () => {
    if (!selectedAsset || !walletAddresses) return '';
    
    switch (selectedAsset.symbol) {
      case 'USDT':
        return selectedNetwork === 'ERC20' ? walletAddresses.eth : walletAddresses.tron;
      case 'ETH':
        return walletAddresses.eth;
      case 'BTC':
        return walletAddresses.btc;
      default:
        return '';
    }
  };

  const getQRCodeUrl = () => {
    if (!selectedAsset || !qrCodesReady || !walletAddresses) return '';
    
    return QRCodeManager.getQRCodeForAsset(
      selectedAsset.symbol,
      selectedNetwork,
      walletAddresses
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    if (asset.networks) {
      setSelectedNetwork(asset.networks[0]);
    }
  };

  const handleBackToSelection = () => {
    setSelectedAsset(null);
    setSelectedNetwork('ERC20');
  };

  const handleBackToWallet = () => {
    router.push('/wallet');
  };

  const displayCoins = getDisplayCoins();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {selectedAsset ? (
            /* Selected Asset Header with Icon + Text + Back Button */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAsset.icon}
                  alt={selectedAsset.name}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/40/3B82F6/FFFFFF?text=${selectedAsset.symbol}`;
                  }}
                />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Receive {selectedAsset.symbol}
                </h1>
              </div>
              
              <button
                onClick={handleBackToSelection}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Asset Selection Header */
            <div className="flex items-center justify-between w-full">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Receive Crypto
              </h1>
              
              <button
                onClick={handleBackToWallet}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {!selectedAsset ? (
          /* Asset Selection */
          <div className="max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Select a cryptocurrency to receive
            </p>
            
            {walletLoading || !isInitialized ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="w-13 h-13 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayCoins.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleAssetSelect(asset)}
                    className="w-full flex items-center space-x-4 p-6 bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 group hover:scale-[1.02]"
                  >
                    <img
                      src={asset.icon}
                      alt={asset.name}
                      className="w-13 h-13 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/52/3B82F6/FFFFFF?text=${asset.symbol}`;
                      }}
                    />
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {asset.symbol}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {asset.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Selected Asset View */
          <div className="max-w-lg mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="text-center space-y-5">
                {/* Network Selector for USDT */}
                {selectedAsset.networks && (
                  <div className="flex justify-center space-x-3">
                    {selectedAsset.networks.map((network: string) => (
                      <button
                        key={network}
                        onClick={() => setSelectedNetwork(network)}
                        className={cn(
                          "px-6 py-3 rounded-2xl font-medium transition-all duration-200",
                          selectedNetwork === network
                            ? "bg-blue-600 text-white scale-105"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        {network}
                      </button>
                    ))}
                  </div>
                )}

                {/* QR Code */}
                {getCurrentAddress() && (
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-3xl">
                      {qrCodesReady ? (
                        <img
                          src={getQRCodeUrl()}
                          alt="QR Code"
                          className="w-40 h-40"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Address */}
                {getCurrentAddress() && (
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {selectedAsset.symbol} Address {selectedAsset.networks ? `(${selectedNetwork})` : ''}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <div className="flex items-center justify-between space-x-4">
                        <p className="text-sm font-mono text-gray-900 dark:text-white break-all flex-1 address-text">
                          {getCurrentAddress()}
                        </p>
                        <button
                          onClick={() => copyToClipboard(getCurrentAddress())}
                          className="flex-shrink-0 p-3 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                        >
                          {copiedAddress ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {copiedAddress && (
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        Address copied to clipboard!
                      </p>
                    )}
                  </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Important:</strong> Only send {selectedAsset.symbol} 
                    {selectedAsset.networks ? ` on ${selectedNetwork} network` : ''} to this address. 
                    Sending other cryptocurrencies may result in permanent loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}