import { ElementType, jsxProps } from "./type";

export default function createElement(
  type: ElementType,
  props: jsxProps,
  ...children: any[]
) {
  if (typeof type === "function") {
    const result = type(props || {});

    if (result && typeof result === "object" && "type" in result) {
      const mergedChildren = result.props?.children || children;
      return {
        ...result,
        props: {
          ...result.props,
          children: mergedChildren,
        },
      };
    }

    return { type: type.name, props: result || {}, children: [] };
  }

  const { children: propChildren, ...restProps } = props || {};
  const mergedChildren = propChildren || children;

  return {
    type,
    props: {
      ...restProps,
      children: mergedChildren,
    },
  };
}