import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  walletApi, 
  WalletCache, 
  CACHE_KEYS, 
  CACHE_DURATION,
  type Coin,
  type BalanceData,
  type PriceData,
  type P24hData,
  type PriceUpdate
} from '@/lib/wallet-cache';
import { useWalletContext } from '@/components/WalletProvider';

export function useWalletData() {
  const { walletAddress, isInitialized } = useWalletContext();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [wsConnected, setWsConnected] = useState(false);
  
  // Data states
  const [coins, setCoins] = useState<Coin[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData>({});
  const [priceData, setPriceData] = useState<PriceData>({});
  const [p24hData, setP24hData] = useState<P24hData>({});
  
  // Loading states
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Error states
  const [coinsError, setCoinsError] = useState<Error | null>(null);
  const [balanceError, setBalanceError] = useState<Error | null>(null);

  // Fetch coins
  const fetchCoins = useCallback(async () => {
    try {
      setCoinsLoading(true);
      setCoinsError(null);
      const data = await walletApi.fetchCoins();
      setCoins(data);
    } catch (error) {
      setCoinsError(error as Error);
      // Try to load from cache on error
      const cached = WalletCache.get<Coin[]>(CACHE_KEYS.COINS);
      if (cached) {
        setCoins(cached);
      }
    } finally {
      setCoinsLoading(false);
    }
  }, []);

  // Fetch balance - now uses wallet address from context
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalanceLoading(false);
      return;
    }

    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const data = await walletApi.fetchBalance(walletAddress);
      setBalanceData(data);
    } catch (error) {
      setBalanceError(error as Error);
      // Try to load from cache on error
      const cacheKey = `${CACHE_KEYS.BALANCE}_${walletAddress}`;
      const cached = WalletCache.get<BalanceData>(cacheKey);
      if (cached) {
        setBalanceData(cached);
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket('wss://web3.auryonex.com/user-asset-price');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: PriceUpdate = JSON.parse(event.data);
          if (data.type === 'price_update') {
            // Update price data
            setPriceData(prev => {
              const updated = { ...prev, [data.coinId]: data.price };
              WalletCache.set(CACHE_KEYS.PRICES, updated, CACHE_DURATION.PRICES);
              return updated;
            });

            // Update p24h data if available
            if (data.p24h !== undefined) {
              setP24hData(prev => {
                const updated = { ...prev, [data.coinId]: data.p24h! };
                WalletCache.set(CACHE_KEYS.P24H, updated, CACHE_DURATION.P24H);
                return updated;
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setWsConnected(false);
        wsRef.current = null;

        // Exponential backoff reconnection
        if (!event.wasClean) {
          const delay = Math.min(1000 * Math.pow(2, Math.random() * 3), 30000);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setWsConnected(false);
      
      // Retry connection after delay
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    }
  }, []);

  // Initialize data and WebSocket when wallet is ready
  useEffect(() => {
    if (!isInitialized) return;

    // Load cached data first
    const cachedCoins = WalletCache.get<Coin[]>(CACHE_KEYS.COINS);
    if (cachedCoins) {
      setCoins(cachedCoins);
      setCoinsLoading(false);
    }

    if (walletAddress) {
      const balanceCacheKey = `${CACHE_KEYS.BALANCE}_${walletAddress}`;
      const cachedBalance = WalletCache.get<BalanceData>(balanceCacheKey);
      if (cachedBalance) {
        setBalanceData(cachedBalance);
        setBalanceLoading(false);
      }
    }

    const cachedPrices = WalletCache.get<PriceData>(CACHE_KEYS.PRICES);
    if (cachedPrices) {
      setPriceData(cachedPrices);
    }

    const cachedP24h = WalletCache.get<P24hData>(CACHE_KEYS.P24H);
    if (cachedP24h) {
      setP24hData(cachedP24h);
    }

    // Fetch fresh data
    fetchCoins();
    fetchBalance();

    // Connect WebSocket
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [isInitialized, walletAddress, fetchCoins, fetchBalance, connectWebSocket]);

  // Background refresh for stale data
  useEffect(() => {
    if (!isInitialized || !walletAddress) return;

    const interval = setInterval(() => {
      // Refetch coins if stale
      if (WalletCache.isStale(CACHE_KEYS.COINS, CACHE_DURATION.COINS)) {
        fetchCoins();
      }

      // Refetch balance if stale
      const balanceCacheKey = `${CACHE_KEYS.BALANCE}_${walletAddress}`;
      if (WalletCache.isStale(balanceCacheKey, CACHE_DURATION.BALANCE)) {
        fetchBalance();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isInitialized, walletAddress, fetchCoins, fetchBalance]);

  // Retry functions
  const retryConnection = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  }, [connectWebSocket]);

  const retryDataFetch = useCallback(() => {
    fetchCoins();
    fetchBalance();
  }, [fetchCoins, fetchBalance]);

  return {
    // Data
    coins,
    balanceData,
    priceData,
    p24hData,
    
    // Loading states
    isLoading: coinsLoading || balanceLoading,
    coinsLoading,
    balanceLoading,
    
    // Error states
    error: coinsError || balanceError,
    coinsError,
    balanceError,
    
    // WebSocket state
    wsConnected,
    
    // Retry functions
    retryConnection,
    retryDataFetch,
    refetchCoins: fetchCoins,
    refetchBalance: fetchBalance,
  };
}