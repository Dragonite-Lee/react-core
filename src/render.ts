import { JSXNode, JSXElement, ElementType } from "./type";

// 타입 가드: JSXNode인지 확인
const isJSXNode = (child: unknown): child is JSXNode =>
  typeof child === "object" &&
  child !== null &&
  "type" in child &&
  "key" in child &&
  "props" in child;

function updateDOMProperties(dom, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "key") continue;

    if (typeof value === "string" || typeof value === "number") {
      dom.setAttribute(key, value.toString());
    }
  }
}

function updateChildren(dom, children) {
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach((child) => {
    if (child === null) return; // null 또는 undefined는 무시
    const childDom = createRealDOM(child);
    dom.appendChild(childDom);
  });
}

// 가상 DOM을 실제 DOM으로 변환
function createRealDOM(virtualDOM: JSXNode | string | number): Node {
  // 문자열 또는 숫자인 경우 텍스트 노드 생성
  if (typeof virtualDOM === "string" || typeof virtualDOM === "number") {
    return document.createTextNode(virtualDOM.toString());
  }

  const { type, props } = virtualDOM;
  const { children = [], ...otherProps } = props || {};

  // 함수 컴포넌트 처리
  if (typeof type === "function") {
    const result = type(props);
    if (!isJSXNode(result)) {
      throw new Error("유효하지 않은 반환 형태");
    }
    return createRealDOM(result);
  }

  // HTML 요소 생성
  const dom = document.createElement(type);

  // 속성 처리
  updateDOMProperties(dom, otherProps);

  // 자식 요소 처리
  updateChildren(dom, children);

  return dom;
}

function reconcile(
  parentDom: HTMLElement,
  oldNode: JSXNode | string | number | null,
  newNode: JSXNode | string | number | null
): Node | null {
  // 1. 둘다 텍스트 노드인 경우
  if (
    (typeof oldNode === "string" || typeof oldNode === "number") &&
    (typeof newNode === "string" || typeof newNode === "number")
  ) {
    
  }
}

// 렌더러 구현
export function createRoot(container: HTMLElement) {
  if (!(container instanceof HTMLElement)) {
    throw new Error("Container is not HTMLElement");
  }

  let currentElement: JSXNode | null = null; // 이전 가상 DOM 저장

  const render = (virtualDOM: JSXNode) => {
    if (!isJSXNode(virtualDOM)) {
      throw new Error("virtualDOM는 객체여야함");
    }

    
    if (currentElement === null) {
      // 최초 렌더링!!!
      container.innerHTML = "";
      const dom = createRealDOM(virtualDOM);
      container.appendChild(dom);
    } else {
      // 최초 렌더링이 아니면 diffing 알고리즘 
      reconcile(container, currentElement, virtualDOM)
    }
    currentElement = virtualDOM; // 현재 가상 DOM 저장
  };

  const unmount = () => {
    container.innerHTML = "";
    currentElement = null;
  };

  return { render, unmount };
}
