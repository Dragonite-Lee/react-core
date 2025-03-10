import { jsxProps } from "../type";
import { jsx } from "./jsx-runtime";

export function jsxDEV(type: string, config: jsxProps, key: string, _isStatic: boolean, source: any) {
  const { children, ...props } = config || {};
  return jsx(type, { ...props, key, __source: source }, key);
}

export const Fragment = Symbol.for("jsx.fragment");