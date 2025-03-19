import render from "../render";
import { SetStateAction, VNode } from "../type";
import { debounceFrame } from "./debounce";

// 상태 관리 전역 변수
let states: any[] = [];
let stateIndex = 0;
let currentComponent: () => VNode;
let rootContainer: HTMLElement;
let pendingUpdates: { [key: number]: SetStateAction<any>[] } = {};

const rerender = () => {
    for (const key in pendingUpdates) {
      let currentState = states[key];
      for (const update of pendingUpdates[key]) {
        currentState = update(currentState);
      }
      states[key] = currentState;
    }
    pendingUpdates = {};
    stateIndex = 0;
    const newVNode = currentComponent();
    render(newVNode, rootContainer);
  };

// 디바운스된 rerender
const debouncedRerender = debounceFrame(rerender);

export function useState<T>(
  initialValue: T
): [T, (newValue: SetStateAction<T>) => void] {
  const key = stateIndex;
  if (states.length === key) {
    states.push(initialValue);
  }

  const state = states[key];

  const setState = (newValue: SetStateAction<T>) => {
    if (!pendingUpdates[key]) pendingUpdates[key] = [];
    const updateFn = typeof newValue === "function"
      ? (newValue as (prev: T) => T)
      : (_: T) => newValue;
    pendingUpdates[key].push(updateFn);
    debouncedRerender();
  };

  stateIndex++;
  return [state, setState];
}

export function renderComponent(
  component: () => VNode,
  container: HTMLElement
) {
  states = []; // 상태 초기화
  stateIndex = 0;
  currentComponent = component;
  rootContainer = container;
  const vNode = component();
  render(vNode, container); // 최초 렌더링은 즉시 실행
}
