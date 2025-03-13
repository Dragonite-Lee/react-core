function renderRealDOM(element: any) {

  // 돔 생성
  const dom = document.createElement(element.type);

  if (element.props) {
    for (const [key, value] of Object.entries(element.props)) {
      if (key === "children") {
        // 여러 개와 혼자일 때 구분
        if (Array.isArray(value)) {
          value.forEach((child, index) => {
            render(child, dom);
          });
        } else if (value !== null && value !== undefined) {
          render(value, dom);
        }
      } else if (typeof value === "string" || typeof value === "number") {
        dom.setAttribute(key, value.toString());
      }
    }
  }
  return dom
}

export default function render(element: any, container: HTMLElement) {
      // 텍스트 노드 추가 작업
  if (typeof element === "string" || typeof element === "number") {
    const textNode = document.createTextNode(element.toString());
    container.appendChild(textNode);
    return;
  }
  // 객체 생성 분기처리
  if (!element || typeof element !== "object" || !element.type) {
    return;
  }

  container.appendChild(renderRealDOM(element));
}

// 컴포넌트 유형이 항상다르다고 생각하여 diff를 진행하지 않고 트리 자체를 새로운 트리로 대체한다.
