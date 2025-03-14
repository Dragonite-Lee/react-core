import render from "../render";
import { VNode } from "../type";

// 상태 관리 전역 변수
let state: any[] = [];
let stateIndex = 0;
let currentComponent: () => VNode;
let rootContainer: HTMLElement;

export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  const currentIndex = stateIndex; // -> state 갯수를 useState가 실행되는 횟수만큼 만들기
  stateIndex++;

  if (state[currentIndex] === undefined) {
    state[currentIndex] = initialValue;
  }

  // 새로운 state를 할당하면 rerender
  const setState = (newValue: T) => {
    state[currentIndex] = newValue;
    rerender();
  };
  
  return [state[currentIndex], setState];
}

function rerender() {
  stateIndex = 0;
  const newVNode = currentComponent();
  render(newVNode, rootContainer);
}

export function renderComponent(component: () => VNode, container: HTMLElement) {
  state = [];
  stateIndex = 0;
  currentComponent = component;
  rootContainer = container;
  const vNode = component();
  render(vNode, container);
}
