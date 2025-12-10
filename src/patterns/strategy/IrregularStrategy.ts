import { ColorSource, Graphics } from 'pixi.js';
import { ShapeDrawingStrategy } from './ShapeDrawingStrategy';

export class IrregularStrategy implements ShapeDrawingStrategy {
  draw(g: Graphics, size: number, color: ColorSource): number {
    const pointCount = 5 + Math.floor(Math.random() * 4);
    const verts: number[] = [];
    let angle = Math.random() * Math.PI * 2;
    for (let i = 0; i < pointCount; i++) {
      const radius = 16 + Math.random() * 18;
      verts.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
      angle += (Math.PI * 2) / pointCount + (Math.random() - 0.5) * 0.2;
    }
    // Draw irregular polygon manually for PixiJS v8
    g.moveTo(verts[0], verts[1]);
    for (let i = 2; i < verts.length; i += 2) {
      g.lineTo(verts[i], verts[i + 1]);
    }
    g.closePath();
    g.fill(color);
    return this.polygonArea(verts);
  }

  private polygonArea(flatPoints: number[]): number {
    let sum = 0;
    const n = flatPoints.length / 2;
    for (let i = 0; i < n; i++) {
      const xi = flatPoints[i * 2];
      const yi = flatPoints[i * 2 + 1];
      const xj = flatPoints[((i + 1) % n) * 2];
      const yj = flatPoints[((i + 1) % n) * 2 + 1];
      sum += xi * yj - xj * yi;
    }
    return Math.abs(sum) * 0.5;
  }
}

