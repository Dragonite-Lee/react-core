import { VNode } from './type';

// 타입 가드 사용함
const isVNode = (child: unknown): child is VNode =>
  typeof child === 'object' && child !== null && 'type' in child;

const appendChildToDOM = (
  dom: HTMLElement,
  child: VNode['props']['children']
) => {
  if (typeof child === 'string' || typeof child === 'number') {
    dom.appendChild(document.createTextNode(child.toString()));
  } else if (isVNode(child)) {
    dom.appendChild(renderRealDOM(child));
  }
};

function appendChildren(
  dom: HTMLElement,
  children: VNode['props']['children']
): void {
  if (!children) return;

  const childArray = Array.isArray(children) ? children.flat() : [children];
  childArray.forEach((child) => appendChildToDOM(dom, child));
}

function renderRealDOM(vnode: VNode): HTMLElement {
  const dom = document.createElement(vnode.type);

  if (!vnode.props) return dom;

  for (const [key, value] of Object.entries(vnode.props)) {
    switch (key) {
      case 'children':
        appendChildren(dom, value as VNode['props']['children']);
        break;
      case 'checked':
        (dom as HTMLInputElement).checked = !!value;
        break;
      default:
        if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.slice(2).toLowerCase();
          dom.addEventListener(eventName, value as EventListener);
        } else if (typeof value === 'string' || typeof value === 'number') {
          dom.setAttribute(key, value.toString());
        }
    }
  }

  return dom;
}

let prevVNode: VNode | null = null;

export default function render(vnode: VNode, container: HTMLElement): void {
  if (!prevVNode) {
    container.appendChild(renderRealDOM(vnode));
  } else if (JSON.stringify(prevVNode) !== JSON.stringify(vnode)) {
    container.replaceChildren(renderRealDOM(vnode));
  }
  prevVNode = { ...vnode };
}
