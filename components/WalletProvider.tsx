"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  walletAddresses: {
    eth: string;
    tron: string;
    btc: string;
  } | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  retryAuth: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletAddresses, setWalletAddresses] = useState<{
    eth: string;
    tron: string;
    btc: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check URL for invite parameter
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get('invite');

      // Verify wallet connection
      const eth = (window as any).ethereum || (window as any).trustwallet;
      if (!eth) {
        throw new Error('Please open via MetaMask or Trust Wallet');
      }

      // Request wallet access
      await eth.request({ method: 'eth_requestAccounts' });
      const [userAddress] = await eth.request({ method: 'eth_accounts' });
      
      if (!userAddress) {
        throw new Error('No wallet address found');
      }

      // Set the user's wallet address
      setWalletAddress(userAddress);

      // Fetch addresses from API using user's address for auth
      const response = await fetch('https://web3.auryonex.com/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: userAddress,
          invite: invite || null
        })
      });

      if (response.ok) {
        const addresses = await response.json();
        setWalletAddresses({
          eth: addresses.eth || '',
          tron: addresses.tron || '',
          btc: addresses.btc || ''
        });
      } else {
        throw new Error('Failed to authenticate wallet');
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize wallet');
      
      // Set fallback data for demo purposes
      setWalletAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7');
      setWalletAddresses({
        eth: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
        tron: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
        btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      });
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const retryAuth = () => {
    setError(null);
    setIsInitialized(false);
    initializeWallet();
  };

  useEffect(() => {
    // Initialize wallet on mount
    initializeWallet();
  }, []);

  const value: WalletContextType = {
    walletAddress,
    walletAddresses,
    isInitialized,
    isLoading,
    error,
    retryAuth
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}