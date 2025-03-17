import render from "../render";
import { VNode } from "../type";
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

export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  const key = stateIndex;
  if (states.length === key) {
    states.push(initialValue);
  }

  const state = states[key];

  const setState = (newValue: T) => {
    if (newValue === state) return;
    // 배열이나 객체일 때 비교하려고 삽입
    if (JSON.stringify(newValue) === JSON.stringify(state)) return;

    states[key] = newValue;
    rerender();
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
