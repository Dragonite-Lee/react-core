import createElement from "../createElement";
import {
  ElementType,
  JSXProps,
  JSXRuntimeFn,
  Key,
  REACT_FRAGMENT_TYPE,
  ReactNode,
} from "../type";

const __DEV__ = true;

const toChildArray = (children: any): ReactNode[] =>
  children === undefined ? [] : Array.isArray(children) ? children : [children];

function _jsx(
  type: ElementType,
  config: any,
  maybeKey: Key | undefined,
  isStaticChildren: boolean
) {
  const cfg = config ?? {};
  const key: Key = maybeKey ?? cfg.key ?? null;
  const ref = cfg.ref ?? null;

  const { children, key: _k, ref: _r, ...rest } = cfg;
  const props: JSXProps = { ...rest };

  const childArgs = toChildArray(children);

  // React DEV에서: static children인 배열을 freeze해서 불변성 가정/버그 탐지
  if (__DEV__ && isStaticChildren && Array.isArray(children)) {
    Object.freeze(children);
  }

  return createElement(type, props, key, ref, ...childArgs);
}

export const jsx: JSXRuntimeFn = (type, config, maybeKey) =>
  _jsx(type, config, maybeKey, false);

export const jsxs: JSXRuntimeFn = (type, config, maybeKey) =>
  _jsx(type, config, maybeKey, true);

export const Fragment = REACT_FRAGMENT_TYPE;
