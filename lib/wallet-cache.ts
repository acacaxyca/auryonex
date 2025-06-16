export interface Coin {
  coin_id: string;
  name: string;
  symbol: string;
  icon: string;
}

export interface BalanceData {
  [symbol: string]: number;
}

export interface PriceData {
  [coinId: string]: number;
}

export interface P24hData {
  [coinId: string]: number;
}

export interface PriceUpdate {
  type: 'price_update';
  coinId: string;
  price: number;
  p24h?: number;
}

export const CACHE_KEYS = {
  COINS: 'wallet_coins_cache',
  CURRENCY: 'wallet_currency_setting',
  BALANCE: 'wallet_balance_cache',
  PRICES: 'wallet_prices_cache',
  P24H: 'wallet_p24h_cache',
  LAST_UPDATE: 'wallet_last_update'
} as const;

export const CACHE_DURATION = {
  COINS: 1000 * 60 * 30, // 30 minutes
  BALANCE: 1000 * 60 * 5, // 5 minutes
  PRICES: 1000 * 30, // 30 seconds
  P24H: 1000 * 60 * 5 // 5 minutes
} as const;

// Cache utilities
export class WalletCache {
  static set<T>(key: string, data: T, ttl?: number): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttl || CACHE_DURATION.PRICES
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (parsed.timestamp + parsed.ttl < now) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  static clear(): void {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static isStale(key: string, maxAge: number): boolean {
    try {
      const item = localStorage.getItem(key);
      if (!item) return true;

      const parsed = JSON.parse(item);
      return Date.now() - parsed.timestamp > maxAge;
    } catch {
      return true;
    }
  }
}

// API functions with caching
export const walletApi = {
  async fetchCoins(): Promise<Coin[]> {
    const cached = WalletCache.get<Coin[]>(CACHE_KEYS.COINS);
    if (cached && !WalletCache.isStale(CACHE_KEYS.COINS, CACHE_DURATION.COINS)) {
      return cached;
    }

    const response = await fetch('https://web3.auryonex.com/user_asset');
    if (!response.ok) {
      throw new Error(`Failed to fetch coins: ${response.statusText}`);
    }
    
    const coins: Coin[] = await response.json();
    WalletCache.set(CACHE_KEYS.COINS, coins, CACHE_DURATION.COINS);
    return coins;
  },

  async fetchBalance(address: string): Promise<BalanceData> {
    const cacheKey = `${CACHE_KEYS.BALANCE}_${address}`;
    const cached = WalletCache.get<BalanceData>(cacheKey);
    if (cached && !WalletCache.isStale(cacheKey, CACHE_DURATION.BALANCE)) {
      return cached;
    }

    const response = await fetch('https://web3.auryonex.com/balance_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }

    const result = await response.json();
    const balance = result.balance_data;
    WalletCache.set(cacheKey, balance, CACHE_DURATION.BALANCE);
    return balance;
  }
};