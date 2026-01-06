import { debounceFrame } from "./hooks/debounce";
import { beginHooks, endHooks, HookedInstance } from "./hooks/dispatcher";
import {
  REACT_ELEMENT_TYPE,
  REACT_FRAGMENT_TYPE,
  ReactElement,
  ReactNode,
} from "./type";

type Instance = HookedInstance & {
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

function moveRange(parent: Node, inst: Instance, before: Node | null) {
  const frag = document.createDocumentFragment();

  const after = inst.end.nextSibling;
  let cur: ChildNode | null = inst.start;
  while (cur && cur !== after) {
    const next = cur.nextSibling as ChildNode | null;
    frag.appendChild(cur);
    cur = next;
  }

  parent.insertBefore(frag, before);
}

function unmountInstance(inst: Instance) {
  if (isElement(inst.element) && typeof inst.element.type === "function") {
    const effects = inst.effects ?? [];
    for (const e of effects) {
      if (typeof e?.cleanup === "function") e.cleanup();
    }
  }
  for (const c of inst.childInstances) unmountInstance(c);
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

function insertInstanceBefore(
  parent: Node,
  inst: Instance,
  before: Node | null
) {
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
    const inst: Instance = {
      element,
      start: document.createComment("fc"),
      end: document.createComment("fc"),
      childInstances: [],
      hooks: element ? [] : [],
      effects: [],
    };

    beginHooks(inst);
    const rendered = element.type(element.props);
    endHooks();

    const child = instantiate(rendered);
    inst.childInstances = [child];
    inst.start = child.start;
    inst.end = child.end;
    return inst;
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
    (typeof instance.element === "string" ||
      typeof instance.element === "number")
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

    instance.element = nextEl;

    beginHooks(instance);
    const rendered = nextEl.type(nextEl.props);
    endHooks();

    const nextChild = reconcile(parent, prevChild, rendered, before);

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

  const keyedPrev = new Map<any, Instance>();
  const unkeyedPrev: Instance[] = [];

  for (const ci of prevChildInsts) {
    const el = ci.element;
    if (isElement(el) && el.key != null) keyedPrev.set(el.key, ci);
    else unkeyedPrev.push(ci);
  }

  const nextChildInsts: Instance[] = [];
  let unkeyIdx = 0;

  // 1) 업데이트/생성
  for (const childEl of nextChildEls) {
    let match: Instance | null = null;

    if (isElement(childEl) && childEl.key != null) {
      match = keyedPrev.get(childEl.key) ?? null;
      if (match) keyedPrev.delete(childEl.key);
    } else {
      match = unkeyedPrev[unkeyIdx++] ?? null;
    }

    // 여기서는 위치(before)는 일단 null(append)로 해도 됨.
    // 실제 정렬은 아래 moveRange로 맞춘다.
    const updated = reconcile(dom, match, childEl, null);
    nextChildInsts.push(updated);
  }

  // 2) 남은 prev 제거
  for (const leftover of keyedPrev.values()) {
    unmountInstance(leftover);
    removeRange(dom, leftover.start, leftover.end);
  }
  for (let i = unkeyIdx; i < unkeyedPrev.length; i++) {
    unmountInstance(unkeyedPrev[i]);
    removeRange(dom, unkeyedPrev[i].start, unkeyedPrev[i].end);
  }

  // 3) DOM 재정렬(중요): key 매칭만 해도 "위치 이동"을 안 하면 React처럼 안 됨
  // 뒤에서 앞으로 reverse로 옮기면 anchor가 안정적임.
  let anchor: Node | null = null; // null이면 append
  for (let i = nextChildInsts.length - 1; i >= 0; i--) {
    const childInst = nextChildInsts[i];
    moveRange(dom, childInst, anchor);
    anchor = childInst.start;
  }

  instance.element = nextEl;
  instance.childInstances = nextChildInsts;
  instance.start = dom;
  instance.end = dom;
  return instance;
}

let rootInstance: Instance | null = null;
let rootElement: ReactNode | null = null;
let rootContainer: HTMLElement | null = null;

export function render(element: ReactNode, container: HTMLElement) {
  rootElement = element;
  rootContainer = container;

  rootInstance = reconcile(container, rootInstance, element, null);
  flushEffects();
}

const pendingEffects: Array<{
  inst: HookedInstance;
  idx: number;
  effect: () => void | (() => void);
}> = [];

export function pushPendingEffect(
  inst: HookedInstance,
  idx: number,
  effect: () => void | (() => void)
) {
  pendingEffects.push({ inst, idx, effect });
}

function flushEffects() {
  while (pendingEffects.length) {
    const job = pendingEffects.shift()!;
    job.inst.effects ??= [];
    job.inst.effects[job.idx] ??= {};

    const prevCleanup = job.inst.effects[job.idx].cleanup;
    if (typeof prevCleanup === "function") prevCleanup();

    const cleanup = job.effect();
    job.inst.effects[job.idx].cleanup = cleanup;
  }
}

// 업데이트 스케줄러 (frame 단위 디바운스)
const _doUpdate = () => {
  if (!rootContainer || rootElement == null) return;
  rootInstance = reconcile(rootContainer, rootInstance, rootElement, null);
  flushEffects();
};

const debouncedUpdate = debounceFrame(_doUpdate);

export function scheduleUpdate() {
  debouncedUpdate();
}
