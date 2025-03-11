import App from "./App";

function render(element: any, container: HTMLElement) {
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
  // 돔 생성
  const dom = document.createElement(element.type);

  if (element.props) {
    for (const [key, value] of Object.entries(element.props)) {
      if (key === "children") {
        // 여러 개와 혼자일 때 구분
        if (Array.isArray(value)) {
          value.forEach((child, index) => {
            if (child && typeof child === "object" && "type" in child) {
              render(child, dom);
            } else if (typeof child === "string" || typeof child === "number") {
              render(child, dom);
            }
          });
        } else if (value !== null && value !== undefined) {
          render(value, dom);
        }
      } else if (typeof value === "string" || typeof value === "number") {
        dom.setAttribute(key, value.toString());
      }
    }
  }
  container.appendChild(dom);
}

const appElement = App();
console.log("가상돔 생성:", JSON.stringify(appElement, null, 2));
const root = document.getElementById("root");
if (root) {
  render(appElement, root);
}
