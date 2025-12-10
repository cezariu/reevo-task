import { ColorSource, Graphics } from 'pixi.js';
import { ShapeType } from '../types/ShapeType';
import { ShapeDrawingStrategy } from '../patterns/strategy/ShapeDrawingStrategy';
import { RegularPolygonStrategy } from '../patterns/strategy/RegularPolygonStrategy';
import { CircleStrategy } from '../patterns/strategy/CircleStrategy';
import { EllipseStrategy } from '../patterns/strategy/EllipseStrategy';
import { StarStrategy } from '../patterns/strategy/StarStrategy';
import { IrregularStrategy } from '../patterns/strategy/IrregularStrategy';
import { MemoryManager } from '../utils/MemoryManager';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';

export class ShapeFactory {
  private static strategyCache: Map<ShapeType, ShapeDrawingStrategy> = new Map();

  static randomColor(): ColorSource {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}deg 75% 60%)`;
  }

  static createRandom(): { type: ShapeType; color: ColorSource } {
    const types = [
      ShapeType.Triangle,
      ShapeType.Square,
      ShapeType.Pentagon,
      ShapeType.Hexagon,
      ShapeType.Circle,
      ShapeType.Ellipse,
      ShapeType.Star,
      ShapeType.Irregular,
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    return { type, color: ShapeFactory.randomColor() };
  }

  private static getStrategy(type: ShapeType): ShapeDrawingStrategy {
    if (!this.strategyCache.has(type)) {
      let strategy: ShapeDrawingStrategy;
      switch (type) {
        case ShapeType.Triangle:
          strategy = new RegularPolygonStrategy(3);
          break;
        case ShapeType.Square:
          strategy = new RegularPolygonStrategy(4);
          break;
        case ShapeType.Pentagon:
          strategy = new RegularPolygonStrategy(5);
          break;
        case ShapeType.Hexagon:
          strategy = new RegularPolygonStrategy(6);
          break;
        case ShapeType.Circle:
          strategy = new CircleStrategy();
          break;
        case ShapeType.Ellipse:
          strategy = new EllipseStrategy();
          break;
        case ShapeType.Star:
          strategy = new StarStrategy();
          break;
        case ShapeType.Irregular:
        default:
          strategy = new IrregularStrategy();
          break;
      }
      this.strategyCache.set(type, strategy);
    }
    return this.strategyCache.get(type)!;
  }

  static createGraphic(type: ShapeType, color: ColorSource): { graphic: Graphics; area: number } {
    const g = MemoryManager.acquireGraphics();
    const qualityMultiplier = PerformanceOptimizer.getQualityMultiplier();
    const baseSize = 18 + Math.random() * 22;
    const size = baseSize * qualityMultiplier;
    
    const strategy = this.getStrategy(type);
    const area = strategy.draw(g, size, color);
    return { graphic: g, area };
  }

  static releaseGraphic(graphic: Graphics): void {
    MemoryManager.releaseGraphics(graphic);
  }
}

