import {
  REACT_ELEMENT_TYPE,
  REACT_FRAGMENT_TYPE,
  ReactElement,
  ReactNode,
} from "./type";

type Instance = {
  element: ReactNode;
  start: ChildNode;
  end: ChildNode;
  childInstances: Instance[];
};

const isElement = (x: any): x is ReactElement =>
  !!x && typeof x === "object" && x.$$typeof === REACT_ELEMENT_TYPE;

const isIgnorable = (x: ReactNode) =>
  x === null || x === undefined || typeof x === "boolean";

function toArray(node: ReactNode): ReactNode[] {
  if (isIgnorable(node)) return [];
  return Array.isArray(node) ? node : [node];
}

function flatten(nodes: ReactNode[], out: ReactNode[] = []): ReactNode[] {
  for (const n of nodes) {
    if (Array.isArray(n)) flatten(n, out);
    else if (!isIgnorable(n)) out.push(n);
  }
  return out;
}

function removeRange(parent: Node, start: ChildNode, end: ChildNode) {
  const after = end.nextSibling;
  let cur: ChildNode | null = start;
  while (cur && cur !== after) {
    const next = cur.nextSibling as ChildNode | null;
    parent.removeChild(cur);
    cur = next;
  }
}

/**
 * 핵심 변경: Instance를 "DOM fragment"로 만들어서 삽입
 * - fragment/function component/host/text 모두 일관되게 삽입 가능
 * - start..end가 미리 nextSibling으로 연결돼 있을 필요가 없음
 */
function toDomFragment(inst: Instance): DocumentFragment {
  const frag = document.createDocumentFragment();

  // ReactElement가 아니면(text/empty/invalid) -> start 하나만 붙이면 됨
  if (!isElement(inst.element)) {
    frag.appendChild(inst.start);
    return frag;
  }

  const el = inst.element;

  // Function component: childInstances[0]이 실제 렌더 결과
  if (typeof el.type === "function") {
    const child = inst.childInstances[0];
    if (child) frag.appendChild(toDomFragment(child));
    else frag.appendChild(inst.start);
    return frag;
  }

  // Fragment: start + children + end
  if (el.type === REACT_FRAGMENT_TYPE) {
    frag.appendChild(inst.start);
    for (const c of inst.childInstances) frag.appendChild(toDomFragment(c));
    frag.appendChild(inst.end);
    return frag;
  }

  // Host element: start(=dom) 하나만
  frag.appendChild(inst.start);
  return frag;
}

function insertInstanceBefore(parent: Node, inst: Instance, before: Node | null) {
  parent.insertBefore(toDomFragment(inst), before);
}

function setProp(dom: HTMLElement, key: string, value: any) {
  if (key === "children") return;

  if (key === "className") {
    dom.setAttribute("class", value ?? "");
    return;
  }

  if (key === "style" && value && typeof value === "object") {
    Object.assign(dom.style, value);
    return;
  }

  if (key === "checked") {
    (dom as HTMLInputElement).checked = !!value;
    return;
  }

  if (key === "value") {
    (dom as HTMLInputElement).value = value ?? "";
    return;
  }

  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    const store = ((dom as any).__listeners ??= {});
    if (store[eventName]) dom.removeEventListener(eventName, store[eventName]);
    store[eventName] = value;
    dom.addEventListener(eventName, value);
    return;
  }

  if (value === false || value === null || value === undefined) {
    dom.removeAttribute(key);
    return;
  }

  dom.setAttribute(key, String(value));
}

function updateProps(dom: HTMLElement, prev: any, next: any) {
  const prevObj = prev ?? {};
  const nextObj = next ?? {};

  for (const k of Object.keys(prevObj)) {
    if (!(k in nextObj)) setProp(dom, k, undefined);
  }

  for (const k of Object.keys(nextObj)) {
    if (prevObj[k] !== nextObj[k]) setProp(dom, k, nextObj[k]);
  }
}

function instantiate(element: ReactNode): Instance {
  if (isIgnorable(element)) {
    const c = document.createComment("empty");
    return { element, start: c, end: c, childInstances: [] };
  }

  // ✅ 텍스트는 TextNode로
  if (typeof element === "string" || typeof element === "number") {
    const t = document.createTextNode(String(element));
    return { element, start: t, end: t, childInstances: [] };
  }

  if (!isElement(element)) {
    const c = document.createComment("invalid");
    return { element, start: c, end: c, childInstances: [] };
  }

  // function component
  if (typeof element.type === "function") {
    const rendered = element.type(element.props);
    const child = instantiate(rendered);
    return {
      element,
      start: child.start,
      end: child.end,
      childInstances: [child],
    };
  }

  // fragment
  if (element.type === REACT_FRAGMENT_TYPE) {
    const start = document.createComment("fragment-start");
    const end = document.createComment("fragment-end");

    const children = flatten(toArray(element.props.children));
    const childInstances = children.map(instantiate);

    return { element, start, end, childInstances };
  }

  // host element
  const dom = document.createElement(element.type as string);

  const props = element.props ?? {};
  for (const [k, v] of Object.entries(props)) setProp(dom, k, v);

  const childEls = flatten(toArray(props.children));
  const childInstances = childEls.map(instantiate);

  for (const ci of childInstances) {
    insertInstanceBefore(dom, ci, null);
  }

  return { element, start: dom, end: dom, childInstances };
}

function sameKind(a: ReactNode, b: ReactNode): boolean {
  const aText = typeof a === "string" || typeof a === "number";
  const bText = typeof b === "string" || typeof b === "number";
  if (aText || bText) return aText && bText;

  if (isElement(a) && isElement(b)) return a.type === b.type;

  return false;
}

function reconcile(
  parent: Node,
  instance: Instance | null,
  element: ReactNode,
  before: Node | null
): Instance {
  if (!instance) {
    const newInst = instantiate(element);
    insertInstanceBefore(parent, newInst, before);
    return newInst;
  }

  if (isIgnorable(element)) {
    removeRange(parent, instance.start, instance.end);
    const newInst = instantiate(element);
    insertInstanceBefore(parent, newInst, before);
    return newInst;
  }

  if (!sameKind(instance.element, element)) {
    const after = instance.end.nextSibling;
    removeRange(parent, instance.start, instance.end);
    const newInst = instantiate(element);
    insertInstanceBefore(parent, newInst, after);
    return newInst;
  }

  // text update
  if (
    (typeof element === "string" || typeof element === "number") &&
    (typeof instance.element === "string" || typeof instance.element === "number")
  ) {
    if (String(element) !== String(instance.element)) {
      (instance.start as Text).nodeValue = String(element);
    }
    instance.element = element;
    return instance;
  }

  const prevEl = instance.element as ReactElement;
  const nextEl = element as ReactElement;

  // function component update
  if (typeof nextEl.type === "function") {
    const prevChild = instance.childInstances[0] ?? null;
    const rendered = nextEl.type(nextEl.props);
    const nextChild = reconcile(parent, prevChild, rendered, before);

    instance.element = nextEl;
    instance.start = nextChild.start;
    instance.end = nextChild.end;
    instance.childInstances = [nextChild];
    return instance;
  }

  // fragment update
  if (nextEl.type === REACT_FRAGMENT_TYPE) {
    const start = instance.start;
    const end = instance.end;

    const prevChildren = instance.childInstances;
    const nextChildren = flatten(toArray(nextEl.props.children));

    const keyedPrev = new Map<any, Instance>();
    const unkeyedPrev: Instance[] = [];

    for (const ci of prevChildren) {
      const el = ci.element;
      if (isElement(el) && el.key != null) keyedPrev.set(el.key, ci);
      else unkeyedPrev.push(ci);
    }

    const nextInsts: Instance[] = [];
    let unkeyIdx = 0;

    // end 앞에 순서대로 reconcile
    for (const childEl of nextChildren) {
      let match: Instance | null = null;

      if (isElement(childEl) && childEl.key != null) {
        match = keyedPrev.get(childEl.key) ?? null;
        if (match) keyedPrev.delete(childEl.key);
      } else {
        match = unkeyedPrev[unkeyIdx++] ?? null;
      }

      const updated = reconcile(parent, match, childEl, end);
      nextInsts.push(updated);
    }

    // remove leftovers
    for (const leftover of keyedPrev.values()) {
      removeRange(parent, leftover.start, leftover.end);
    }
    for (let i = unkeyIdx; i < unkeyedPrev.length; i++) {
      removeRange(parent, unkeyedPrev[i].start, unkeyedPrev[i].end);
    }

    instance.element = nextEl;
    instance.start = start;
    instance.end = end;
    instance.childInstances = nextInsts;
    return instance;
  }

  // host update
  const dom = instance.start as HTMLElement;
  updateProps(dom, prevEl.props, nextEl.props);

  const prevChildInsts = instance.childInstances;
  const nextChildEls = flatten(toArray(nextEl.props.children));

  const nextChildInsts: Instance[] = [];
  const max = Math.max(prevChildInsts.length, nextChildEls.length);

  for (let i = 0; i < max; i++) {
    const prevChild = prevChildInsts[i] ?? null;
    const nextChild = nextChildEls[i];

    if (nextChild === undefined) {
      if (prevChild) removeRange(dom, prevChild.start, prevChild.end);
      continue;
    }

    const updated = reconcile(dom, prevChild, nextChild, null);
    nextChildInsts.push(updated);
  }

  instance.element = nextEl;
  instance.childInstances = nextChildInsts;
  instance.start = dom;
  instance.end = dom;
  return instance;
}

let rootInstance: Instance | null = null;

export function render(element: ReactNode, container: HTMLElement) {
  rootInstance = reconcile(container, rootInstance, element, null);
}
