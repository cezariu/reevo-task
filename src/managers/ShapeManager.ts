import { Container, Rectangle } from 'pixi.js';
import { Shape } from '../models/Shape';
import { SpawnConfig } from '../config/SpawnConfig';
import { StatsSubject } from '../patterns/observer/StatsSubject';
import { StatsObserver } from '../patterns/observer/StatsObserver';
import { GameConfig } from '../config/GameConfig';
import { ShapeFactory } from '../factories/ShapeFactory';
import { ShapeType } from '../types/ShapeType';
import { Graphics } from 'pixi.js';
import { RemoveShapeCommand } from '../patterns/command/RemoveShapeCommand';
import { MemoryManager } from '../utils/MemoryManager';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';

export class ShapeManager implements StatsObserver {
  private shapes: Shape[] = [];
  private spawnAccumulator = 0;
  private maxShapes: number;
  private statsUpdateThrottle: number;

  constructor(
    private container: Container,
    private bounds: Rectangle,
    private config: SpawnConfig,
    private statsSubject: StatsSubject,
    maxShapes: number = GameConfig.MAX_SHAPES,
    statsUpdateThrottle: number = 100,
  ) {
    this.maxShapes = maxShapes;
    this.statsUpdateThrottle = statsUpdateThrottle;
    this.statsSubject.subscribe(this);
  }

  // Observer Pattern: Implement StatsObserver interface
  onStatsUpdate(count: number, area: number): void {
    // This is called by StatsSubject, but we're the one updating it
    // This pattern allows other observers to be added if needed
  }

  setSpawnPerSecond(value: number): void {
    this.config.spawnPerSecond = value;
  }

  setGravity(value: number): void {
    this.config.gravity = value;
  }

  getSpawnPerSecond(): number {
    return this.config.spawnPerSecond;
  }

  getGravity(): number {
    return this.config.gravity;
  }

  spawnRandomFromTop(): void {
    if (this.shapes.length >= this.maxShapes) return;
    const { type, color } = ShapeFactory.createRandom();
    const { graphic, area } = ShapeFactory.createGraphic(type, color);
    const x = Math.random() * this.bounds.width;
    this.addShape(graphic, area, x, -40);
  }

  spawnAt(x: number, y: number): void {
    if (this.shapes.length >= this.maxShapes) return;
    // Bonus requirement 3a: Click spawns irregular shape with random color
    const color = ShapeFactory.randomColor();
    const { graphic, area } = ShapeFactory.createGraphic(ShapeType.Irregular, color);
    this.addShape(graphic, area, x, y);
  }

  private addShape(graphic: Graphics, area: number, x: number, y: number): void {
    graphic.position.set(x, y);
    graphic.eventMode = 'static';
    graphic.cursor = 'pointer';
    const shape = new Shape(graphic, area);

    const handleRemove = (event: any) => {
      event.stopPropagation();
      event.preventDefault();
      const command = new RemoveShapeCommand(this, shape);
      command.execute();
    };
    
    graphic.on('pointerdown', handleRemove);
    graphic.on('touchstart', handleRemove);
    
    this.container.addChild(graphic);
    this.shapes.push(shape);
    this.updateStats();
  }

  removeShape(shape: Shape): void {
    this.container.removeChild(shape.graphic);
    MemoryManager.releaseGraphics(shape.graphic);
    shape.destroy();
    this.shapes = this.shapes.filter((s) => s !== shape);
    this.updateStats();
  }

  update(deltaSeconds: number): void {
    PerformanceOptimizer.updateFPS(deltaSeconds * 1000);

    this.spawnAccumulator += deltaSeconds * this.config.spawnPerSecond;
    while (this.spawnAccumulator >= 1) {
      this.spawnRandomFromTop();
      this.spawnAccumulator -= 1;
    }

    for (const shape of this.shapes) {
      shape.updatePosition(deltaSeconds, this.config.gravity);
    }

    const limitY = this.bounds.height + 60;
    this.shapes = this.shapes.filter((shape) => {
      if (shape.graphic.y > limitY) {
        this.container.removeChild(shape.graphic);
        MemoryManager.releaseGraphics(shape.graphic);
        shape.destroy();
        return false;
      }
      return true;
    });
    
    if (PerformanceOptimizer.shouldUpdateStats(this.statsUpdateThrottle)) {
      this.updateStats();
    }
  }

  private updateStats(): void {
    const visibleShapes = this.shapes.filter((shape) => {
      const pos = shape.graphic.position;
      const bounds = shape.graphic.getBounds();
      const margin = 20;
      return (
        pos.x + bounds.width > -margin &&
        pos.x < this.bounds.width + margin &&
        pos.y + bounds.height > -margin &&
        pos.y < this.bounds.height + margin
      );
    });
    const count = visibleShapes.length;
    const area = visibleShapes.reduce((sum, s) => sum + s.area, 0);
    this.statsSubject.notify(count, Math.round(area));
  }

  getVisibleShapesCount(): number {
    return this.shapes.filter((shape) => {
      const pos = shape.graphic.position;
      const bounds = shape.graphic.getBounds();
      return (
        pos.x + bounds.width > 0 &&
        pos.x < this.bounds.width &&
        pos.y + bounds.height > 0 &&
        pos.y < this.bounds.height
      );
    }).length;
  }
}

