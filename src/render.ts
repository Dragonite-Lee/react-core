import { VNode } from "./type";

// 타입 가드
const isVNode = (child: unknown): child is VNode =>
  typeof child === "object" && child !== null && "type" in child;

// 텍스트 노드 병합 함수
function mergeTextNodes(children: (VNode | string | number)[]): (VNode | string)[] {
  const merged: (VNode | string)[] = [];
  let textBuffer = "";

  for (const child of children) {
    if (typeof child === "string" || typeof child === "number") {
      textBuffer += child.toString();
    } else {
      if (textBuffer) {
        merged.push(textBuffer);
        textBuffer = "";
      }
      merged.push(child);
    }
  }

  if (textBuffer) {
    merged.push(textBuffer);
  }

  return merged;
}

const appendChildToDOM = (
  dom: HTMLElement,
  child: VNode | string
) => {
  if (typeof child === "string") {
    dom.appendChild(document.createTextNode(child));
  } else if (isVNode(child)) {
    dom.appendChild(renderRealDOM(child));
  }
};

function appendChildren(
  dom: HTMLElement,
  children: VNode["props"]["children"]
): void {
  if (!children) return;
  const childArray = Array.isArray(children) ? children.flat() : [children];
  // 텍스트 노드 병합
  const mergedChildren = mergeTextNodes(childArray);
  mergedChildren.forEach((child) => appendChildToDOM(dom, child));
}

function renderRealDOM(vnode: VNode): HTMLElement {
  const dom = document.createElement(vnode.type);
  (dom as any).__vnode = vnode;

  if (!vnode.props) return dom;

  for (const [key, value] of Object.entries(vnode.props)) {
    switch (key) {
      case "children":
        appendChildren(dom, value as VNode["props"]["children"]);
        break;
      case "checked":
        (dom as HTMLInputElement).checked = !!value;
        break;
      case "value":
        if (vnode.type === "input") {
          (dom as HTMLInputElement).value = value?.toString() || "";
        } else {
          dom.setAttribute(key, value.toString());
        }
        break;
      case "key":
        if (typeof value === "string" || typeof value === "number") {
          (dom as any).__key = value;
        }
        break;
      default:
        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.slice(2).toLowerCase();
          dom.addEventListener(eventName, value as EventListener);
        } else if (typeof value === "string" || typeof value === "number") {
          dom.setAttribute(key, value.toString());
        }
    }
  }
  return dom;
}

function reconcileChildren(
  parentDom: HTMLElement,
  oldChildren: (VNode | string | number)[],
  newChildren: (VNode | string | number)[]
) {

  const mergedOldChildren = mergeTextNodes(oldChildren);
  const mergedNewChildren = mergeTextNodes(newChildren);

  const maxLength = Math.max(mergedOldChildren.length, mergedNewChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = mergedOldChildren[i];
    const newChild = mergedNewChildren[i];

    if (!oldChild && newChild) {
      const newDom =
        typeof newChild === "string"
          ? document.createTextNode(newChild)
          : renderRealDOM(newChild);
      parentDom.appendChild(newDom);
    } else if (oldChild && !newChild) {
      parentDom.removeChild(parentDom.childNodes[i]);
    } else if (oldChild && newChild) {
      diffAndPatch(parentDom, oldChild, newChild, i);
    }
  }
}

function diffAndPatch(
  parentDom: HTMLElement,
  oldVNode: VNode | null | string | number,
  newVNode: VNode | null | string | number,
  index: number = 0
): void {
  if (!oldVNode && !newVNode) return;

  if (oldVNode && !newVNode) {
    parentDom.removeChild(parentDom.childNodes[index]);
    return;
  }

  if (!oldVNode && newVNode) {
    const newDom =
      typeof newVNode === "string"
        ? document.createTextNode(newVNode)
        : renderRealDOM(newVNode as VNode);
    parentDom.appendChild(newDom);
    return;
  }

  if (typeof oldVNode === "string" && typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      const newTextNode = document.createTextNode(newVNode);
      parentDom.replaceChild(newTextNode, parentDom.childNodes[index]);
    }
    return;
  }

  if (typeof oldVNode === "number" && typeof newVNode === "number") {
    if (oldVNode !== newVNode) {
      const newTextNode = document.createTextNode(newVNode.toString());
      parentDom.replaceChild(newTextNode, parentDom.childNodes[index]);
    }
    return;
  }

  if (isVNode(oldVNode) && isVNode(newVNode)) {
    if (oldVNode.type !== newVNode.type) {
      const newDom = renderRealDOM(newVNode);
      parentDom.replaceChild(newDom, parentDom.childNodes[index]);
      return;
    }

    const dom = parentDom.childNodes[index] as HTMLElement;
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

    for (const key of allKeys) {
      if (key === "children" || key === "key") continue;

      const oldValue = oldProps[key];
      const newValue = newProps[key];

      if (newValue === undefined) {
        if (key === "value" && oldVNode.type === "input") {
          (dom as HTMLInputElement).value = "";
        } else {
          dom.removeAttribute(key);
        }
      } else if (oldValue !== newValue) {
        if (key.startsWith("on") && typeof newValue === "function") {
          const eventName = key.slice(2).toLowerCase();
          if (oldValue) {
            dom.removeEventListener(eventName, oldValue as EventListener);
          }
          dom.addEventListener(eventName, newValue as EventListener);
        } else if (key === "checked") {
          (dom as HTMLInputElement).checked = !!newValue;
        } else if (key === "value" && oldVNode.type === "input") {
          const currentValue = (dom as HTMLInputElement).value;
          if (currentValue !== newValue) {
            (dom as HTMLInputElement).value = newValue.toString();
          }
        } else {
          dom.setAttribute(key, newValue.toString());
        }
      }
    }

    const oldChildren = Array.isArray(oldProps.children)
      ? oldProps.children.flat()
      : [oldProps.children].filter(Boolean);
    const newChildren = Array.isArray(newProps.children)
      ? newProps.children.flat()
      : [newProps.children].filter(Boolean);

    reconcileChildren(dom, oldChildren, newChildren);
  }
}

let prevVNode: VNode | null = null;

export default function render(vnode: VNode, container: HTMLElement): void {
  diffAndPatch(container, prevVNode, vnode);
  prevVNode = { ...vnode };
}
