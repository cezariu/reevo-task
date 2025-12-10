export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  isTablet: boolean;
  maxResolution: number;
  antialias: boolean;
  maxShapes: number;
  statsUpdateThrottle: number;
  preferredRenderer: 'webgl' | 'webgpu';
  enableObjectPooling: boolean;
  enableTextureCompression: boolean;
  targetFPS: number;
  enableAdaptiveQuality: boolean;
}

export class DeviceDetector {
  private static cachedCapabilities: DeviceCapabilities | null = null;

  private static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  private static isTabletDevice(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return /ipad|android(?!.*mobile)|tablet/i.test(ua);
  }

  private static isLowEndDevice(): boolean {
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.saveData === true
    );
    
    return hardwareConcurrency <= 2 || deviceMemory <= 2 || isSlowConnection === true;
  }

  private static detectPreferredRenderer(): 'webgl' | 'webgpu' {
    if (typeof GPUAdapter !== 'undefined') {
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      
      if (hardwareConcurrency >= 4 && deviceMemory >= 4) {
        return 'webgpu';
      }
    }
    return 'webgl';
  }

  private static getTargetFPS(isMobile: boolean, isLowEnd: boolean): number {
    if (isLowEnd) return 30;
    if (isMobile) return 45;
    return 60;
  }

  static getOptimalSettings(): DeviceCapabilities {
    if (this.cachedCapabilities) {
      return this.cachedCapabilities;
    }

    const isMobile = this.isMobileDevice();
    const isTablet = this.isTabletDevice();
    const isLowEnd = this.isLowEndDevice();
    const preferredRenderer = this.detectPreferredRenderer();
    const targetFPS = this.getTargetFPS(isMobile, isLowEnd);

    let maxResolution: number;
    if (isLowEnd) {
      maxResolution = 1;
    } else if (isMobile) {
      maxResolution = Math.min(window.devicePixelRatio || 1, 1.5);
    } else if (isTablet) {
      maxResolution = Math.min(window.devicePixelRatio || 1, 2);
    } else {
      maxResolution = Math.min(window.devicePixelRatio || 1, 2);
    }

    let maxShapes: number;
    if (isLowEnd) {
      maxShapes = 80;
    } else if (isMobile) {
      maxShapes = 120;
    } else {
      maxShapes = 200;
    }

    const statsUpdateThrottle = isLowEnd ? 300 : isMobile ? 200 : 100;

    this.cachedCapabilities = {
      isMobile,
      isLowEnd,
      isTablet,
      maxResolution,
      antialias: !isLowEnd && !isMobile,
      maxShapes,
      statsUpdateThrottle,
      preferredRenderer,
      enableObjectPooling: true,
      enableTextureCompression: isLowEnd || isMobile,
      targetFPS,
      enableAdaptiveQuality: true,
    };

    return this.cachedCapabilities;
  }

  static getPerformanceTier(): number {
    const caps = this.getOptimalSettings();
    if (caps.isLowEnd) return 1;
    if (caps.isMobile) return 2;
    return 3;
  }

  static supportsAdvancedFeatures(): boolean {
    const caps = this.getOptimalSettings();
    return !caps.isLowEnd && !caps.isMobile;
  }

  static resetCache(): void {
    this.cachedCapabilities = null;
  }
}

