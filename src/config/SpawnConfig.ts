import { GameConfig } from './GameConfig';

export class SpawnConfig {
  private _spawnPerSecond: number;
  private _gravity: number;

  constructor(
    spawnPerSecond: number = GameConfig.SPAWN_INTERVAL_DEFAULT,
    gravity: number = GameConfig.GRAVITY_DEFAULT,
  ) {
    this._spawnPerSecond = spawnPerSecond;
    this._gravity = gravity;
  }

  get spawnPerSecond(): number {
    return this._spawnPerSecond;
  }

  set spawnPerSecond(value: number) {
    this._spawnPerSecond = Math.max(
      GameConfig.MIN_SPAWN_RATE,
      Math.min(GameConfig.MAX_SPAWN_RATE, value),
    );
  }

  get gravity(): number {
    return this._gravity;
  }

  set gravity(value: number) {
    this._gravity = Math.max(
      GameConfig.MIN_GRAVITY,
      Math.min(GameConfig.MAX_GRAVITY, value),
    );
  }
}

