export interface QRCodeData {
  address: string;
  qrCodeUrl: string;
  timestamp: number;
}

export interface QRCodeCache {
  [key: string]: QRCodeData;
}

const QR_CACHE_KEY = 'wallet_qr_cache';
const QR_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export class QRCodeManager {
  private static cache: QRCodeCache = {};
  private static initialized = false;

  static async initialize(addresses: { eth: string; tron: string; btc: string }) {
    if (this.initialized) return;
    
    // Load existing cache
    this.loadCache();
    
    // Generate QR codes for all addresses
    const promises = [
      this.generateQRCode('eth', addresses.eth),
      this.generateQRCode('tron', addresses.tron),
      this.generateQRCode('btc', addresses.btc),
      this.generateQRCode('usdt_erc20', addresses.eth),
      this.generateQRCode('usdt_trc20', addresses.tron),
    ];

    await Promise.all(promises);
    this.saveCache();
    this.initialized = true;
  }

  static async generateQRCode(key: string, address: string): Promise<string> {
    if (!address) return '';

    // Check if we have a valid cached version
    const cached = this.cache[key];
    if (cached && 
        cached.address === address && 
        Date.now() - cached.timestamp < QR_CACHE_DURATION) {
      return cached.qrCodeUrl;
    }

    // Generate new QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`;
    
    // Preload the image to ensure it's cached by the browser
    try {
      await this.preloadImage(qrCodeUrl);
      
      // Cache the result
      this.cache[key] = {
        address,
        qrCodeUrl,
        timestamp: Date.now()
      };
      
      return qrCodeUrl;
    } catch (error) {
      console.warn('Failed to preload QR code:', error);
      return qrCodeUrl; // Return URL anyway, let browser handle loading
    }
  }

  static getQRCode(key: string, address: string): string {
    const cached = this.cache[key];
    if (cached && cached.address === address) {
      return cached.qrCodeUrl;
    }
    
    // Fallback to direct generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`;
  }

  static async preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  static loadCache(): void {
    try {
      const cached = localStorage.getItem(QR_CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load QR cache:', error);
      this.cache = {};
    }
  }

  static saveCache(): void {
    try {
      localStorage.setItem(QR_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save QR cache:', error);
    }
  }

  static clearCache(): void {
    this.cache = {};
    try {
      localStorage.removeItem(QR_CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear QR cache:', error);
    }
  }

  static getQRCodeForAsset(asset: string, network: string, addresses: { eth: string; tron: string; btc: string }): string {
    let key = '';
    let address = '';

    switch (asset) {
      case 'USDT':
        if (network === 'ERC20') {
          key = 'usdt_erc20';
          address = addresses.eth;
        } else {
          key = 'usdt_trc20';
          address = addresses.tron;
        }
        break;
      case 'ETH':
        key = 'eth';
        address = addresses.eth;
        break;
      case 'BTC':
        key = 'btc';
        address = addresses.btc;
        break;
      default:
        return '';
    }

    return this.getQRCode(key, address);
  }
}