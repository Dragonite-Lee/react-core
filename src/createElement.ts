import { ElementType, jsxProps } from "./type";

export default function createElement(
  type: ElementType,
  props: jsxProps,
  ...children: any[]
): { type: string | ElementType; props: any; children?: any[] } {
  const safeProps = props ?? {};
  const { children: propChildren, ...restProps } = safeProps;

  if (typeof type === "function") {
    const result = type(restProps);
    const isValidResult = result && typeof result === "object" && "type" in result;
    const finalType = isValidResult ? result.type : type;
    const finalProps = isValidResult ? { ...result.props } : (result ?? {});
    const mergedChildren = (isValidResult ? result.props?.children : propChildren) ?? children;

    return {
      type: finalType,
      props: {
        ...finalProps,
        children: mergedChildren,
      },
    };
  }

  return {
    type,
    props: {
      ...restProps,
      children: propChildren ?? children,
    },
  };
}
