import { ColorSource, Graphics } from 'pixi.js';
import { ShapeDrawingStrategy } from './ShapeDrawingStrategy';

export class CircleStrategy implements ShapeDrawingStrategy {
  draw(g: Graphics, size: number, color: ColorSource): number {
    g.circle(0, 0, size);
    g.fill(color);
    return Math.PI * size * size;
  }
}

