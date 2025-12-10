export class GameConfig {
  static readonly PLAYFIELD_WIDTH = 900;
  static readonly PLAYFIELD_HEIGHT = 600;
  static readonly SPAWN_INTERVAL_DEFAULT = 1; // per second
  static readonly GRAVITY_DEFAULT = 400; // px / s^2
  static readonly MAX_SHAPES = 200;
  static readonly MAX_SHAPES_MOBILE = 150;
  static readonly MAX_SHAPES_LOW_END = 100;
  static readonly MIN_SPAWN_RATE = 0.2;
  static readonly MAX_SPAWN_RATE = 10;
  static readonly MIN_GRAVITY = 50;
  static readonly MAX_GRAVITY = 1200;
  static readonly MEMORY_CLEANUP_INTERVAL = 5000; // 5 seconds
}

