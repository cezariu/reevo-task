import { Command } from './Command';
import { Shape } from '../../models/Shape';
import { ShapeManager } from '../../managers/ShapeManager';

export class RemoveShapeCommand implements Command {
  constructor(
    private manager: ShapeManager,
    private shape: Shape,
  ) {}

  execute(): void {
    this.manager.removeShape(this.shape);
  }
}

