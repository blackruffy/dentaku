import { Tag } from './tag';

type StateListener<State> = (sm: StateManager<State>) => void;

export type Component<State> = (
  state: State,
  update: (state: State) => void,
) => Tag;

export type Update<State> = (state: State) => void;

export class StateManager<State> {
  private state: State;
  private stateListener: StateListener<State> | null;

  constructor(state: State) {
    this.state = state;
    this.stateListener = null;
  }

  onUpdate(f: StateListener<State>): void {
    this.stateListener = f;
  }

  update(state: State): void {
    this.state = state;
    this.stateListener?.(this);
  }

  getState(): State {
    return this.state;
  }
}

export function render<State>(component: Component<State>, state: State) {
  window.onload = () => {
    const sm = new StateManager(state);
    const com = component(sm.getState(), _ => sm.update(_));
    document.body.appendChild(com.getTarget());

    sm.onUpdate(sm => {
      const newCom = component(sm.getState(), _ => sm.update(_));
      com.update(newCom);
    });
  };
}
