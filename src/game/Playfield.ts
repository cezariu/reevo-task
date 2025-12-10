import { Application, Container, Graphics, Rectangle } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export class Playfield {
  private fieldContainer: Container;
  private shapesContainer: Container;
  private mask: Graphics;
  private backdrop: Graphics;

  constructor(private app: Application) {
    this.fieldContainer = new Container();
    this.shapesContainer = new Container();
    this.mask = this.createMask();
    this.backdrop = this.createBackdrop();
    this.setupContainers();
  }

  private createMask(): Graphics {
    const mask = new Graphics();
    // Draw border first (thicker, more visible)
    mask.roundRect(0, 0, GameConfig.PLAYFIELD_WIDTH, GameConfig.PLAYFIELD_HEIGHT, 8);
    mask.stroke({ width: 3, color: '#3d5a9f' }); // Bright blue border
    mask.fill('#0c0f1e');
    return mask;
  }

  private createBackdrop(): Graphics {
    const backdrop = new Graphics();
    backdrop.roundRect(0, 0, GameConfig.PLAYFIELD_WIDTH, GameConfig.PLAYFIELD_HEIGHT, 8);
    backdrop.fill('#0e152c'); // Slightly lighter background to differentiate
    return backdrop;
  }

  private setupContainers(): void {
    this.fieldContainer.addChild(this.backdrop, this.shapesContainer);
    this.shapesContainer.mask = this.mask;
    this.app.stage.addChild(this.fieldContainer, this.mask);
  }

  getContainer(): Container {
    return this.shapesContainer;
  }

  getFieldContainer(): Container {
    return this.fieldContainer;
  }

  setupClickHandler(handler: (x: number, y: number) => void): void {
    this.fieldContainer.eventMode = 'static';
    this.fieldContainer.hitArea = new Rectangle(
      0,
      0,
      GameConfig.PLAYFIELD_WIDTH,
      GameConfig.PLAYFIELD_HEIGHT,
    );
    
    // Prevent double-triggering on mobile (both touchstart and pointerdown fire)
    let lastEventTime = 0;
    const DEBOUNCE_MS = 100;
    
    // Handle both mouse and touch events with proper coordinate conversion
    const handlePointerEvent = (event: any) => {
      const now = Date.now();
      // Prevent duplicate events within debounce window
      if (now - lastEventTime < DEBOUNCE_MS) {
        return;
      }
      lastEventTime = now;
      
      // Get position relative to fieldContainer (which has the hitArea)
      // getLocalPosition automatically accounts for scaling and transforms
      const local = event.getLocalPosition(this.fieldContainer);
      
      // Clamp coordinates to valid bounds
      const x = Math.max(0, Math.min(local.x, GameConfig.PLAYFIELD_WIDTH));
      const y = Math.max(0, Math.min(local.y, GameConfig.PLAYFIELD_HEIGHT));
      
      handler(x, y);
    };
    
    // Use pointerdown for all devices (it handles both mouse and touch)
    this.fieldContainer.on('pointerdown', handlePointerEvent);
    
    // Don't add touchstart separately as pointerdown already handles it
    // This prevents double-firing on mobile devices
  }

  resize(host: HTMLElement): void {
    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return; // Skip if element is not visible
    }
    
    // Calculate scale to fit the container
    const scaleX = rect.width / GameConfig.PLAYFIELD_WIDTH;
    const scaleY = rect.height / GameConfig.PLAYFIELD_HEIGHT;
    
    // Always use scaleX on desktop to fill width completely
    // On mobile, use Math.min to fit completely
    const isDesktop = rect.width > 600; // Desktop typically has wider containers
    const scale = isDesktop ? scaleX : Math.min(scaleX, scaleY);
    
    // Ensure scale is valid and not too small
    if (scale > 0 && isFinite(scale) && scale < 10) {
      this.fieldContainer.scale.set(scale);
      this.mask.scale.set(scale);
      
      // Reset x position to ensure content starts at left edge
      this.fieldContainer.x = 0;
      this.mask.x = 0;
      
      // Center the content vertically if needed (on desktop when using scaleX)
      if (isDesktop && scaleX < scaleY) {
        const scaledHeight = GameConfig.PLAYFIELD_HEIGHT * scale;
        const offsetY = (rect.height - scaledHeight) / 2;
        this.fieldContainer.y = offsetY / scale;
        this.mask.y = offsetY / scale;
      } else {
        this.fieldContainer.y = 0;
        this.mask.y = 0;
      }
    }
  }
}

