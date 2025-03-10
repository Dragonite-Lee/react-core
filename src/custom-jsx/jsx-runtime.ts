import createElement from "../createElement";
import { JSX } from "../type";

export const jsx: JSX = (type, config, _key) => {
  const { children, ...props } = config || {};

  return createElement(type, props, children);
};

export const jsxs: JSX = (type, config, key) => {
  const { children, ...props } = config || {};
  const childArray = Array.isArray(children) ? children : children !== undefined ? [children] : [];

  return createElement(type, { ...props, key }, ...childArray);
};

export const Fragment = Symbol.for("jsx.fragment");