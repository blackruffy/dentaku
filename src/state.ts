import { Adapter, Attrs, Listener, setAttrs } from './tag';

export class State<A> {
  private data: A;
  private listeners: Array<[Listener<A>, HTMLElement, () => void]>;

  constructor(a: A) {
    this.data = a;
    this.listeners = [];
  }

  onUpdate(f: Listener<A>): Adapter {
    return (e: HTMLElement) => {
      const cbs = setAttrs(e, f(this.data));
      const removeCbs = () => {
        cbs.forEach(([n, cb]) => e.removeEventListener(n, cb));
      };
      this.listeners.push([f, e, removeCbs]);
    };
  }

  update(g: (a: A) => A): void {
    this.data = g(this.data);
    this.listeners = this.listeners.map(([f, e, remove]) => {
      remove();
      const cbs = setAttrs(e, f(this.data));
      const newRemove = () => {
        cbs.forEach(([n, cb]) => e.removeEventListener(n, cb));
      };
      return [f, e, newRemove];
    });
  }
}
