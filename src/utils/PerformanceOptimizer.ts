export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  frameTime: number;
  isDegraded: boolean;
  qualityLevel: number;
}

export class PerformanceOptimizer {
  private static lastStatsUpdate = 0;
  private static frameCount = 0;
  private static lastFPS = 60;
  private static averageFPS = 60;
  private static fpsHistory: number[] = [];
  private static readonly FPS_HISTORY_SIZE = 60;
  private static qualityLevel = 3;
  private static consecutiveLowFPS = 0;
  private static consecutiveHighFPS = 0;
  private static readonly LOW_FPS_THRESHOLD = 30;
  private static readonly HIGH_FPS_THRESHOLD = 55;
  private static readonly QUALITY_DOWN_THRESHOLD = 5;
  private static readonly QUALITY_UP_THRESHOLD = 30;
  private static targetFPS = 60;
  private static frameTime = 16.67;

  static initialize(targetFPS: number = 60): void {
    this.targetFPS = targetFPS;
    this.frameTime = 1000 / targetFPS;
    this.qualityLevel = 3;
    this.fpsHistory = [];
    this.consecutiveLowFPS = 0;
    this.consecutiveHighFPS = 0;
  }

  static shouldUpdateStats(throttleMs: number): boolean {
    const now = performance.now();
    if (now - this.lastStatsUpdate >= throttleMs) {
      this.lastStatsUpdate = now;
      return true;
    }
    return false;
  }

  static updateFPS(deltaTime: number): void {
    this.frameCount++;
    
    if (deltaTime > 0) {
      this.frameTime = deltaTime;
      this.lastFPS = 1000 / deltaTime;
      
      this.fpsHistory.push(this.lastFPS);
      if (this.fpsHistory.length > this.FPS_HISTORY_SIZE) {
        this.fpsHistory.shift();
      }
      
      if (this.fpsHistory.length > 0) {
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        this.averageFPS = sum / this.fpsHistory.length;
      }
      
      this.adjustQuality();
    }
  }

  private static adjustQuality(): void {
    if (this.lastFPS < this.LOW_FPS_THRESHOLD) {
      this.consecutiveLowFPS++;
      this.consecutiveHighFPS = 0;
      
      if (this.consecutiveLowFPS >= this.QUALITY_DOWN_THRESHOLD && this.qualityLevel > 0) {
        this.qualityLevel--;
        this.consecutiveLowFPS = 0;
      }
    } else if (this.lastFPS >= this.HIGH_FPS_THRESHOLD) {
      this.consecutiveHighFPS++;
      this.consecutiveLowFPS = 0;
      
      if (this.consecutiveHighFPS >= this.QUALITY_UP_THRESHOLD && this.qualityLevel < 3) {
        this.qualityLevel++;
        this.consecutiveHighFPS = 0;
      }
    } else {
      this.consecutiveLowFPS = Math.max(0, this.consecutiveLowFPS - 1);
      this.consecutiveHighFPS = Math.max(0, this.consecutiveHighFPS - 1);
    }
  }

  static getFPS(): number {
    return this.lastFPS;
  }

  static getAverageFPS(): number {
    return this.averageFPS;
  }

  static getFrameTime(): number {
    return this.frameTime;
  }

  static getQualityLevel(): number {
    return this.qualityLevel;
  }

  static getQualityMultiplier(): number {
    return 0.5 + (this.qualityLevel * 0.1667);
  }

  static isPerformanceDegraded(): boolean {
    return this.lastFPS < this.LOW_FPS_THRESHOLD || this.averageFPS < this.LOW_FPS_THRESHOLD;
  }

  static getMetrics(): PerformanceMetrics {
    return {
      fps: this.lastFPS,
      averageFPS: this.averageFPS,
      frameTime: this.frameTime,
      isDegraded: this.isPerformanceDegraded(),
      qualityLevel: this.qualityLevel,
    };
  }

  static shouldSkipFrame(): boolean {
    if (this.targetFPS < 60 && this.lastFPS > this.targetFPS * 1.1) {
      return Math.random() < 0.1;
    }
    return false;
  }

  static requestAnimationFrame(callback: FrameRequestCallback): number {
    return window.requestAnimationFrame(callback);
  }

  static cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id);
  }

  static reset(): void {
    this.frameCount = 0;
    this.lastFPS = 60;
    this.averageFPS = 60;
    this.fpsHistory = [];
    this.qualityLevel = 3;
    this.consecutiveLowFPS = 0;
    this.consecutiveHighFPS = 0;
  }
}

