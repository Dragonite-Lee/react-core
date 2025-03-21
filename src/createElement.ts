import { ElementType, jsxProps } from "./type";

export default function createElement(
  type: ElementType,
  props?: jsxProps,
  ...children: any[]
): { type: string | ElementType; props: any } {
  if (typeof type === "function") {
    const result = type(props ?? {});
    if (result && typeof result === "object" && "type" in result) {
      return result;
    }
    return {
      type,
      props: {
        ...(result ?? {}),
        children: children.length > 0 ? children : undefined,
      },
    };
  }

  const effectiveChildren =
    props?.children ??
    children.filter((child) => child !== undefined && child !== null);
  return {
    type,
    props: {
      ...(props || {}),
      ...(effectiveChildren.length > 0 ? { children: effectiveChildren } : {}),
    },
  };
}
