import { createSyntheticEvent } from "./syntheticEvent";
import { JSXNode, JSXProps, SyntheticEventProps } from "./type";

const eventListeners = new WeakMap<HTMLElement, Map<string, EventListener>>();

function addEventListenerToMap(dom, eventName, listener) {
  if (!eventListeners.has(dom)) {
    eventListeners.set(dom, new Map());
  }
  eventListeners.get(dom).set(eventName, listener);
}

function getEventListeners(dom) {
  return eventListeners.get(dom);
}

function cleanupEventListener(dom: HTMLElement) {
  // 등록된 이벤트 리스너를 모두 제거하는 함수
  const listeners = getEventListeners(dom);
  if (listeners) {
    for (const [eventName, listener] of listeners) {
      dom.removeEventListener(eventName, listener);
    }
    eventListeners.delete(dom); // 리스너 목록에서 DOM을 삭제
  }

  // 자식 요소들에 대해서도 재귀적으로 클린업 실행
  Array.from(dom.children).forEach((child) => {
    cleanupEventListener(child as HTMLElement);
  });
}

function updateDOMProperties(
  dom: Node,
  currentProperties: JSXProps,
  updateProperties: JSXProps
) {
  if (!(dom instanceof HTMLElement)) return;

  // 현재 속성에서 업데이트된 속성과 비교하여 이벤트 리스너를 제거
  for (const [key, value] of Object.entries(currentProperties)) {
    if (key === "children" || key === "key") continue;
    if (!(key in updateProperties)) {
      // 이벤트 리스너 삭제
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        const listener = getEventListeners(dom)?.get(eventName);
        if (listener) {
          dom.removeEventListener(eventName, listener);
          getEventListeners(dom)?.delete(eventName); // 기존 리스너 제거
        }
      } else {
        // 다른 속성 삭제
        dom.removeAttribute(key);
      }
    }
  }

  // 업데이트된 속성에 대해서 새 이벤트 리스너를 추가하거나 속성을 설정
  for (const [key, value] of Object.entries(updateProperties)) {
    if (key === "children" || key === "key") continue;
    if (!(dom instanceof HTMLElement)) return;

    const oldValue = currentProperties[key];
    if (oldValue !== value) {
      if (key === "className") {
        dom.setAttribute("class", value.toString());
      } else if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();
        const listener = (event: Event) => {
          const syntheticEvent = createSyntheticEvent(event);
          (value as (e: SyntheticEventProps) => void)(syntheticEvent);
        };

        // 기존 리스너 제거
        cleanupEventListener(dom);

        // 새 리스너 추가
        dom.addEventListener(eventName, listener);
        addEventListenerToMap(dom, eventName, listener);
      } else {
        dom.setAttribute(key, value.toString());
      }
    }
  }
}


function updateChildren(dom, currentChildren, updateChildren) {
  const currentChildArray = Array.isArray(currentChildren)
    ? currentChildren
    : [currentChildren];
  const updateChildArray = Array.isArray(updateChildren)
    ? updateChildren
    : [updateChildren];

  const currentNodes = Array.from(dom.childNodes);
  currentChildArray.forEach((child, index) => {
    if (!updateChildArray[index]) {
      dom.removeChild(currentNodes[index]);
    } else {
      const newDom = reconcile(dom, child, updateChildArray[index]);
      if (newDom !== currentNodes[index]) {
        dom.replaceChild(newDom, currentNodes[index]);
      }
    }
  });

  for (let i = currentChildArray.length; i < updateChildArray.length; i++) {
    dom.appendChild(createRealDOM(updateChildArray[i]));
  }
}

function createRealDOM(virtualDOM) {
  if (typeof virtualDOM === "string" || typeof virtualDOM === "number") {
    return document.createTextNode(virtualDOM.toString());
  }

  const { type, props } = virtualDOM;
  const dom = document.createElement(type);
  updateDOMProperties(dom, {}, props);
  updateChildren(dom, [], props.children || []);

  return dom;
}

function reconcile(
  parentDOM: HTMLElement,
  oldNode: JSXNode | string | number | null,
  newNode: JSXNode | string | number | null
): Node | null {
  const isJSXNode = (child: unknown): child is JSXNode =>
    typeof child === "object" &&
    child !== null &&
    "type" in child &&
    "props" in child;

  if (!newNode) {
    return null;
  }

  if (!oldNode) {
    const newDom = createRealDOM(newNode);
    if (newDom) parentDOM.appendChild(newDom);
    return newDom;
  }

  if (
    typeof oldNode !== typeof newNode ||
    (isJSXNode(oldNode) && isJSXNode(newNode) && oldNode.type !== newNode.type)
  ) {
    const newDom = createRealDOM(newNode);
    if (newDom && parentDOM.firstChild) {
      parentDOM.replaceChild(newDom, parentDOM.firstChild);
    }
    return newDom;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    const newDOM = document.createTextNode(newNode.toString());
    if (parentDOM.firstChild) {
      parentDOM.replaceChild(newDOM, parentDOM.firstChild);
    }
    return newDOM;
  }

  const oldVNode = oldNode as JSXNode;
  const newVNode = newNode as JSXNode;
  const dom = parentDOM.firstChild as HTMLElement;

  updateDOMProperties(dom, oldVNode.props || {}, newVNode.props || {});
  reconcileChildren(
    dom,
    oldVNode.props?.children || [],
    newVNode.props?.children || []
  );

  return dom;
}

function reconcileChildren(
  parent: HTMLElement,
  oldChildren: any[],
  newChildren: any[]
) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  newChildren.forEach((child) => {
    const newChildNode = createRealDOM(child);
    if (newChildNode) parent.appendChild(newChildNode);
  });
}

export function createRoot(container) {
  let currentElement = null;

  return {
    render(virtualDOM) {
      if (!currentElement) {
        container.innerHTML = "";
        container.appendChild(createRealDOM(virtualDOM));
      } else {
        reconcile(container, currentElement, virtualDOM);
      }
      currentElement = virtualDOM;
    },
    unmount() {
      container.innerHTML = "";
      currentElement = null;
    },
  };
}
