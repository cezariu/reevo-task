export interface StatsObserver {
  onStatsUpdate(count: number, area: number): void;
}

