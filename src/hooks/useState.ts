import { stateManager, rerender, getComponentState } from "./core";
import { SetStateAction } from "../type";

export function useState<T>(
  initialValue: T
): [T, (newValue: SetStateAction<T>) => void] {
  const componentState = getComponentState(stateManager.currentComponent!);
  const key = componentState.index;

  if (componentState.states.length === key) {
    componentState.states.push(initialValue);
  }

  const state = componentState.states[key] as T;

  const setState = (newValue: SetStateAction<T>) => {
    componentState.pendingUpdates[key] = componentState.pendingUpdates[key] || [];
    componentState.pendingUpdates[key].push(newValue);
    console.log(`Pending updates after setState for key ${key}:`, componentState.pendingUpdates);
    rerender(stateManager.currentComponent!);
  };

  componentState.index++;
  return [state, setState];
}
