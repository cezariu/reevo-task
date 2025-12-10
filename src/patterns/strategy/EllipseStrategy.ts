import { ColorSource, Graphics } from 'pixi.js';
import { ShapeDrawingStrategy } from './ShapeDrawingStrategy';

export class EllipseStrategy implements ShapeDrawingStrategy {
  draw(g: Graphics, size: number, color: ColorSource): number {
    const ry = size * 0.7;
    g.ellipse(0, 0, size, ry);
    g.fill(color);
    return Math.PI * size * ry;
  }
}

