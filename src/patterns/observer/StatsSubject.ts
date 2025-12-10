import { StatsObserver } from './StatsObserver';

export class StatsSubject {
  private observers: StatsObserver[] = [];

  subscribe(observer: StatsObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: StatsObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notify(count: number, area: number): void {
    this.observers.forEach((observer) => observer.onStatsUpdate(count, area));
  }
}

