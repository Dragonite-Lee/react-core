import {
  ElementType,
  JSXProps,
  Key,
  REACT_ELEMENT_TYPE,
  ReactElement,
  ReactNode,
  Ref,
} from "./type";

function normalizeChildren(children: ReactNode[]): ReactNode {
  if (children.length === 0) return undefined;
  if (children.length === 1) return children[0];
  return children;
}

export default function createElement(
  type: ElementType,
  props?: JSXProps,
  key: Key = null,
  ref: Ref = null,
  ...children: ReactNode[]
): ReactElement {
  const resolvedProps: JSXProps = { ...(props ?? {}) };

  // react애서 1개일 땐 문자열로 리턴해줄 수 있다는 점 반영
  if (children.length > 0) {
    resolvedProps.children = normalizeChildren(children);
  } else if ("children" in resolvedProps) {
  } else {
    resolvedProps.children = undefined;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props: resolvedProps,
  };
}
