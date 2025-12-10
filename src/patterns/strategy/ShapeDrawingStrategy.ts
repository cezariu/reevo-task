import { ColorSource, Graphics } from 'pixi.js';

export interface ShapeDrawingStrategy {
  draw(g: Graphics, size: number, color: ColorSource): number; // Returns area
}

