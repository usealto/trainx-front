import { BehaviorSubject, Observable } from 'rxjs';

export class Store<T> {
  private holder: BehaviorSubject<T>;

  get value$(): Observable<T> {
    return this.holder.asObservable();
  }

  get value(): T {
    return this.holder.value;
  }

  set value(v: T) {
    this.holder.next(v);
  }

  add(v: unknown) {
    if (Array.isArray(this.holder.value)) {
      this.holder.next([...this.holder.value, v] as unknown as T);
    }
  }

  constructor(val: T) {
    this.holder = new BehaviorSubject<T>(val);
  }
}
