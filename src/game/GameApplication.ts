import { Application, Rectangle } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';
import { SpawnConfig } from '../config/SpawnConfig';
import { StatsSubject } from '../patterns/observer/StatsSubject';
import { ShapeManager } from '../managers/ShapeManager';
import { Playfield } from './Playfield';
import { HUDObserver } from '../ui/HUDObserver';
import { DeviceDetector } from '../utils/DeviceDetector';
import { MemoryManager } from '../utils/MemoryManager';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';

export class GameApplication {
  private app!: Application;
  private playfield!: Playfield;
  private manager!: ShapeManager;
  private statsSubject: StatsSubject;
  private config: SpawnConfig;
  private deviceSettings: ReturnType<typeof DeviceDetector.getOptimalSettings>;
  private memoryCleanupInterval?: number;

  constructor() {
    this.config = new SpawnConfig();
    this.statsSubject = new StatsSubject();
    this.deviceSettings = DeviceDetector.getOptimalSettings();
  }

  async initialize(host: HTMLElement): Promise<void> {
    this.setupMobileOptimizations(host);
    PerformanceOptimizer.initialize(this.deviceSettings.targetFPS);

    this.app = new Application();
    await this.app.init({
      width: GameConfig.PLAYFIELD_WIDTH,
      height: GameConfig.PLAYFIELD_HEIGHT,
      antialias: this.deviceSettings.antialias,
      resolution: Math.min(window.devicePixelRatio, this.deviceSettings.maxResolution),
      backgroundAlpha: 0,
      powerPreference: 'high-performance',
      autoDensity: true,
      preference: this.deviceSettings.preferredRenderer,
      clearBeforeRender: true,
      preserveDrawingBuffer: false,
    });

    if (this.app.renderer && 'textureGC' in this.app.renderer) {
      const textureGC = (this.app.renderer as any).textureGC;
      if (textureGC) {
        textureGC.maxIdle = this.deviceSettings.isLowEnd ? 10000 : 30000;
        textureGC.checkCountMax = this.deviceSettings.isLowEnd ? 30 : 60;
      }
    }
    
    const canvas = this.app.canvas;
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    (canvas.style as any).webkitTouchCallout = 'none';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    
    host.appendChild(canvas);

    this.playfield = new Playfield(this.app);
    this.playfield.setupClickHandler((x, y) => {
      this.manager.spawnAt(x, y);
    });

    this.manager = new ShapeManager(
      this.playfield.getContainer(),
      new Rectangle(0, 0, GameConfig.PLAYFIELD_WIDTH, GameConfig.PLAYFIELD_HEIGHT),
      this.config,
      this.statsSubject,
      this.deviceSettings.maxShapes,
      this.deviceSettings.statsUpdateThrottle,
    );

    // Optimized ticker with frame skipping for low-end devices
    this.app.ticker.add((ticker) => {
      const deltaSeconds = ticker.deltaMS / 1000;
      PerformanceOptimizer.updateFPS(ticker.deltaMS);
      
      if (!PerformanceOptimizer.shouldSkipFrame()) {
        this.manager.update(deltaSeconds);
      }
    });

    this.startMemoryCleanup();
  }

  private setupMobileOptimizations(host: HTMLElement): void {
    if (this.deviceSettings.isMobile) {
      let lastTouchEnd = 0;
      const preventZoom = (event: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      };

      host.addEventListener('touchend', preventZoom, { passive: false });
      
      let touchStartY = 0;
      document.body.addEventListener(
        'touchstart',
        (e) => {
          touchStartY = e.touches[0].clientY;
        },
        { passive: true },
      );

      document.body.addEventListener(
        'touchmove',
        (e) => {
          if (window.scrollY === 0 && e.touches[0].clientY > touchStartY) {
            e.preventDefault();
          }
        },
        { passive: false },
      );
    }
  }

  private startMemoryCleanup(): void {
    this.memoryCleanupInterval = window.setInterval(() => {
      MemoryManager.cleanup();
    }, GameConfig.MEMORY_CLEANUP_INTERVAL);
  }

  destroy(): void {
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
    }
    
    MemoryManager.clearPool();
    PerformanceOptimizer.reset();
    
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }

  setupHUD(countElement: HTMLElement, areaElement: HTMLElement): void {
    const hudObserver = new HUDObserver(countElement, areaElement);
    this.statsSubject.subscribe(hudObserver);
  }

  setupControls(
    spawnRateLabel: HTMLElement,
    gravLabel: HTMLElement,
    spawnInc: HTMLElement,
    spawnDec: HTMLElement,
    gravInc: HTMLElement,
    gravDec: HTMLElement,
  ): void {
    const spawnRateLabelMobile = document.getElementById('spawn-rate-mobile');
    const gravLabelMobile = document.getElementById('grav-value-mobile');
    const spawnIncMobile = document.getElementById('spawn-inc-mobile');
    const spawnDecMobile = document.getElementById('spawn-dec-mobile');
    const gravIncMobile = document.getElementById('grav-inc-mobile');
    const gravDecMobile = document.getElementById('grav-dec-mobile');

    const updateLabels = () => {
      spawnRateLabel.textContent = this.config.spawnPerSecond.toFixed(1);
      gravLabel.textContent = this.config.gravity.toFixed(0);
      if (spawnRateLabelMobile) spawnRateLabelMobile.textContent = this.config.spawnPerSecond.toFixed(1);
      if (gravLabelMobile) gravLabelMobile.textContent = this.config.gravity.toFixed(0);
    };

    updateLabels();

    if (spawnInc) {
      spawnInc.addEventListener('click', () => {
        this.config.spawnPerSecond += 0.5;
        updateLabels();
      });
    }
    if (spawnIncMobile) {
      spawnIncMobile.addEventListener('click', () => {
        this.config.spawnPerSecond += 0.5;
        updateLabels();
      });
    }

    if (gravInc) {
      gravInc.addEventListener('click', () => {
        this.config.gravity += 50;
        updateLabels();
      });
    }
    if (gravIncMobile) {
      gravIncMobile.addEventListener('click', () => {
        this.config.gravity += 50;
        updateLabels();
      });
    }

    // Setup decrease buttons
    if (spawnDec) {
      spawnDec.addEventListener('click', () => {
        this.config.spawnPerSecond -= 0.5;
        updateLabels();
      });
    }
    if (spawnDecMobile) {
      spawnDecMobile.addEventListener('click', () => {
        this.config.spawnPerSecond -= 0.5;
        updateLabels();
      });
    }

    if (gravDec) {
      gravDec.addEventListener('click', () => {
        this.config.gravity -= 50;
        updateLabels();
      });
    }
    if (gravDecMobile) {
      gravDecMobile.addEventListener('click', () => {
        this.config.gravity -= 50;
        updateLabels();
      });
    }
  }

  setupResize(host: HTMLElement): void {
    const resizeCanvas = () => {
      requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.app.renderer.resize(rect.width, rect.height);
          const canvas = this.app.canvas;
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          this.playfield.resize(host);
        }
      });
    };
    
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(host);
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeCanvas, 100);
    });
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeCanvas);
    }
  }

  getManager(): ShapeManager {
    return this.manager;
  }
}

