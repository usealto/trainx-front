import { BehaviorSubject, Observable } from 'rxjs';

export class Store<T> {
  private initValue: T;
  private holder: BehaviorSubject<T>;
  /**
   * UNIX timestamp
   */
  private createdAt = 0;
  /**
   * N minutes after createdAt
   */
  private expire = 0;

  get value$(): Observable<T> {
    this.resetIfExpired();
    return this.holder.asObservable();
  }

  get value(): T {
    this.resetIfExpired();
    return this.holder.value;
  }

  set value(v: T) {
    this.updateDate();
    this.holder.next(v);
  }

  add(v: unknown) {
    if (Array.isArray(this.holder.value)) {
      this.updateDate();
      this.holder.next([...this.holder.value, v] as unknown as T);
    }
  }

  /**
   *
   * @param initValue Default Init value: '{} as T' for an object or [] for array
   * @param expire Lifetime of this cache in minutes. Default is 5. 0 is forever.
   */
  constructor(initValue: T, expire = 5) {
    this.initValue = initValue;
    this.holder = new BehaviorSubject<T>(initValue);
    this.expire = expire;
    this.updateDate();
  }

  isExpired(): boolean {
    return (new Date().valueOf() - this.createdAt) / 60_000 >= this.expire;
  }

  reset() {
    this.value = this.initValue;
  }

  private resetIfExpired() {
    if (this.isExpired()) {
      this.reset();
    }
  }

  private updateDate() {
    this.createdAt = new Date().valueOf();
  }
}
