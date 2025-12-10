import { StatsObserver } from '../patterns/observer/StatsObserver';

export class HUDObserver implements StatsObserver {
  constructor(
    private countElement: HTMLElement,
    private areaElement: HTMLElement,
  ) {}

  onStatsUpdate(count: number, area: number): void {
    this.countElement.textContent = count.toString();
    this.areaElement.textContent = `${area} px²`;
  }
}

