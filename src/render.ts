import { VNode } from "./type";

function appendChildren(
  dom: HTMLElement,
  children: VNode["props"]["children"]
) {
  if (!children) return;
  const childArray = Array.isArray(children) ? children.flat() : [children];
  childArray.forEach((child) => {
    if (typeof child === "string" || typeof child === "number") {
      dom.appendChild(document.createTextNode(child.toString()));
    } else if (typeof child === "object" && child !== null && "type" in child) {
      dom.appendChild(renderRealDOM(child as VNode));
    }
  });
}

function renderRealDOM(element: VNode): HTMLElement {
  const dom = document.createElement(element.type);

  if (element.props) {
    for (const [key, value] of Object.entries(element.props)) {
      if (key === "children") {
      
        appendChildren(dom, value as VNode["props"]["children"]);
      } else if (typeof value === "string" || typeof value === "number") {
        dom.setAttribute(key, value.toString());
      } else if (key.startsWith("on") && typeof value === "function") {
        dom.addEventListener(
          key.slice(2).toLowerCase(),
          value as EventListener
        );
      }
    }
  }
  return dom;
}

let prevVNode: VNode | null = null;
export default function render(element: VNode, container: HTMLElement): void {
  if (!prevVNode) {
    container.appendChild(renderRealDOM(element));
  } else if (JSON.stringify(prevVNode) !== JSON.stringify(element)) {
    container.innerHTML = "";
    container.appendChild(renderRealDOM(element));
  }
  prevVNode = element;
}

// 컴포넌트 유형이 항상다르다고 생각하여 diff를 진행하지 않고 트리 자체를 새로운 트리로 대체한다. 이용하기!
