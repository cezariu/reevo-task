import { Graphics } from 'pixi.js';

export class Shape {
  private _velocityY: number = 0;
  private _area: number;

  constructor(
    private _graphic: Graphics,
    area: number,
  ) {
    this._area = area;
  }

  get graphic(): Graphics {
    return this._graphic;
  }

  get velocityY(): number {
    return this._velocityY;
  }

  set velocityY(value: number) {
    this._velocityY = value;
  }

  get area(): number {
    return this._area;
  }

  updatePosition(deltaSeconds: number, gravity: number): void {
    this._velocityY += gravity * deltaSeconds;
    this._graphic.y += this._velocityY * deltaSeconds;
  }

  destroy(): void {
    if (this._graphic && !this._graphic.destroyed) {
      this._graphic.removeAllListeners();
    }
  }
}

