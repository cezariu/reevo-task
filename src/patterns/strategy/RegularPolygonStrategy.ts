import { ColorSource, Graphics } from 'pixi.js';
import { ShapeDrawingStrategy } from './ShapeDrawingStrategy';

export class RegularPolygonStrategy implements ShapeDrawingStrategy {
  constructor(private sides: number) {}

  draw(g: Graphics, size: number, color: ColorSource): number {
    const points: number[] = [];
    for (let i = 0; i < this.sides; i++) {
      const angle = (i / this.sides) * Math.PI * 2 - Math.PI / 2;
      points.push(Math.cos(angle) * size, Math.sin(angle) * size);
    }
    // Draw polygon manually for PixiJS v8
    g.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      g.lineTo(points[i], points[i + 1]);
    }
    g.closePath();
    g.fill(color);
    return 0.5 * this.sides * size * size * Math.sin((2 * Math.PI) / this.sides);
  }
}

