import { createElement } from "../createElement";

export function jsx(type, config, key) {
  const { children, ...props } = config;
  return createElement(type, { ...props, key }, children);
}

export function jsxs(type, config, key) {
  const { children, ...props } = config;
  return createElement(type, { ...props, key }, children);
}

export function Fragment(props) {
  return {
    key: props.key,
    props: { children: props.children },
  };
}
