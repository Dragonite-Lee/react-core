import render from "../render";
import { SetStateAction, VNode } from "../type";
import { debounceFrame } from "./debounce";

interface StateManager {
  states: any[];
  index: number;
  pendingUpdates: Record<number, SetStateAction<any>[]>;
  component: () => VNode;
  container: HTMLElement;
}

const stateManager: StateManager = {
  states: [],
  index: 0,
  pendingUpdates: {},
  component: () => ({} as VNode), 
  container: document.createElement("div"), 
};

const applyPendingUpdates = () => {
  for (const [key, updates] of Object.entries(stateManager.pendingUpdates)) {
    let currentState = stateManager.states[Number(key)];
    updates.forEach((update) => {
      currentState = typeof update === "function" 
        ? (update as (prev: any) => any)(currentState)
        : update;
    });
    stateManager.states[Number(key)] = currentState;
  }
  stateManager.pendingUpdates = {};
};

const rerender = () => {
  applyPendingUpdates();
  stateManager.index = 0;
  const newVNode = stateManager.component();
  render(newVNode, stateManager.container);
};

const debouncedRerender = debounceFrame(rerender);

export function useState<T>(initialValue: T): [T, (newValue: SetStateAction<T>) => void] {
  const key = stateManager.index;

  if (stateManager.states.length === key) {
    stateManager.states.push(initialValue);
  }

  const state = stateManager.states[key];

  const setState = (newValue: SetStateAction<T>) => {
    stateManager.pendingUpdates[key] = stateManager.pendingUpdates[key] || [];
    stateManager.pendingUpdates[key].push(newValue);
    debouncedRerender(); 
  };

  stateManager.index++;
  return [state, setState];
}

export function renderComponent(component: () => VNode, container: HTMLElement): void {
  stateManager.states = []; 
  stateManager.index = 0;
  stateManager.component = component;
  stateManager.container = container;
  const vNode = component();
  render(vNode, container); 
}