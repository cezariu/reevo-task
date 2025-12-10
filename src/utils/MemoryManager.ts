import { Graphics } from 'pixi.js';

export class MemoryManager {
  private static readonly CLEANUP_INTERVAL = 5000;
  private static readonly MAX_POOL_SIZE = 30;
  private static readonly MEMORY_PRESSURE_THRESHOLD = 0.85;
  private static readonly TEXTURE_CLEANUP_INTERVAL = 10000;
  
  private static graphicsPool: Graphics[] = [];
  private static lastCleanupTime = 0;
  private static lastTextureCleanupTime = 0;
  private static memoryPressureDetected = false;

  static acquireGraphics(): Graphics {
    if (this.graphicsPool.length > 0) {
      const graphics = this.graphicsPool.pop()!;
      graphics.clear();
      return graphics;
    }
    return new Graphics();
  }

  static releaseGraphics(graphics: Graphics): void {
    if (!graphics || graphics.destroyed) return;
    
    graphics.clear();
    graphics.removeAllListeners();
    graphics.position.set(0, 0);
    graphics.scale.set(1, 1);
    graphics.rotation = 0;
    graphics.alpha = 1;
    graphics.visible = true;
    
    if (this.graphicsPool.length < this.MAX_POOL_SIZE) {
      this.graphicsPool.push(graphics);
    } else {
      this.destroyGraphics(graphics);
    }
  }

  static cleanup(): void {
    const now = performance.now();
    
    if (now - this.lastCleanupTime >= this.CLEANUP_INTERVAL) {
      this.lastCleanupTime = now;
      
      const memoryInfo = this.getMemoryInfo();
      if (memoryInfo.used && memoryInfo.total) {
        const memoryUsage = memoryInfo.used / memoryInfo.total;
        this.memoryPressureDetected = memoryUsage >= this.MEMORY_PRESSURE_THRESHOLD;
        
        if (this.memoryPressureDetected) {
          this.aggressiveCleanup();
        }
      }
      
      if (this.graphicsPool.length > this.MAX_POOL_SIZE) {
        const excess = this.graphicsPool.splice(this.MAX_POOL_SIZE);
        excess.forEach(g => this.destroyGraphics(g));
      }
    }
    
    if (now - this.lastTextureCleanupTime >= this.TEXTURE_CLEANUP_INTERVAL) {
      this.lastTextureCleanupTime = now;
      this.cleanupTextures();
    }
  }

  private static aggressiveCleanup(): void {
    const toRemove = Math.floor(this.graphicsPool.length / 2);
    const removed = this.graphicsPool.splice(0, toRemove);
    removed.forEach(g => this.destroyGraphics(g));
    this.cleanupTextures();
  }

  private static cleanupTextures(): void {
    if (typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (e) {
        // ignore
      }
    }
  }

  static destroyGraphics(graphics: Graphics): void {
    if (!graphics || graphics.destroyed) return;
    
    try {
      graphics.removeAllListeners();
      graphics.clear();
      graphics.destroy({ 
        children: true, 
        texture: true,
        baseTexture: false
      });
    } catch (error) {
      console.warn('Error destroying graphics:', error);
    }
  }

  static getMemoryInfo(): { used?: number; total?: number; limit?: number } {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return {};
  }

  static isMemoryPressureDetected(): boolean {
    return this.memoryPressureDetected;
  }

  static getPoolStats(): { poolSize: number; maxSize: number } {
    return {
      poolSize: this.graphicsPool.length,
      maxSize: this.MAX_POOL_SIZE,
    };
  }

  static clearPool(): void {
    this.graphicsPool.forEach(g => this.destroyGraphics(g));
    this.graphicsPool = [];
  }
}

