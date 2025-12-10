import { ColorSource, Graphics } from 'pixi.js';
import { ShapeDrawingStrategy } from './ShapeDrawingStrategy';

export class StarStrategy implements ShapeDrawingStrategy {
  draw(g: Graphics, size: number, color: ColorSource): number {
    const points = 5;
    const outerRadius = size;
    const innerRadius = size * 0.45;
    const verts: number[] = [];
    const step = Math.PI / points;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      verts.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    // Draw star polygon manually for PixiJS v8
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

