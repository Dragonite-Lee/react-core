import render from "../render";
import { SetStateAction, VNode } from "../type";
import { debounceFrame } from "./debounce";

// 상태 관리 전역 변수
let states: any[] = [];
let stateIndex = 0;
let currentComponent: () => VNode;
let rootContainer: HTMLElement;

const rerender = () => {
  if (!currentComponent || typeof currentComponent !== "function") {
    return;
  }
  if (!rootContainer) {
    return;
  }
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
    const currentState = states[key];
    const updatedValue =
      typeof newValue === "function"
        ? (newValue as (prev: T) => T)(currentState)
        : newValue;

    if (updatedValue === currentState) return;
    states[key] = updatedValue;
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
