import { VNode } from "./type";

function renderRealDOM(element: VNode): HTMLElement {
  // element type을 기반으로 HTML 생성
  const dom = document.createElement(element.type);
  // element props를 기반으로 처리하기
  if (element.props) {
    for (const [key, value] of Object.entries(element.props)) {
      if (key === "children") {
        // 자식 노드 처리
        const children = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
          ? [value]
          : [];
        children.forEach((child) => {
          if (typeof child === "string" || typeof child === "number") {
            dom.appendChild(document.createTextNode(child.toString()));
          } else if (typeof child === "object" && child.type) {
            dom.appendChild(renderRealDOM(child));
          }
        });
      } else if (typeof value === "string" || typeof value === "number") {
        // 일반 속성 처리
        dom.setAttribute(key, value.toString());
      } else if (key.startsWith("on") && typeof value === "function") {
        // 이벤트 핸들러 처리
        dom.addEventListener(
          key.slice(2).toLowerCase(),
          value as EventListener
        );
      }
    }
  }
  return dom;
}

export default function render(
  element: string | number | VNode,
  container: HTMLElement
): void {
  // 루트 초기화
  container.innerHTML = "";

  if (typeof element === "string" || typeof element === "number") {
    container.appendChild(document.createTextNode(element.toString()));
    return;
  }

  if (!element || typeof element !== "object" || !element.type) {
    return;
  }

  container.appendChild(renderRealDOM(element));
}

// 컴포넌트 유형이 항상다르다고 생각하여 diff를 진행하지 않고 트리 자체를 새로운 트리로 대체한다. 이용하기!
