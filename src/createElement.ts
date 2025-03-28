import { ElementType, JSXNode, JSXProps, } from "./type";

export default function createElement(
  type: ElementType,
  config?: JSXProps | null,
  ...children: any[]
): JSXNode {

  // config 정규화 및 key 추출
  config = config ?? {};
  const { key = null, ...props } = config;

  // children 필터링 및 정규화
  const effectiveChildren = children.filter(
    (child) => child !== undefined && child !== null
  );
  const child = effectiveChildren.length === 0
    ? undefined
    : effectiveChildren.length === 1
    ? effectiveChildren[0]
    : effectiveChildren;

    if (typeof type === "function") {
      const componentProps: JSXProps = { key, children: child, ...props };
      const result = type(componentProps);
    
      // 검증하고 렌더러로 전달
      if (result === null || result === undefined) {
        return null;
      }
      if (typeof result === "string" || typeof result === "number") {
        return {
          type: "text",
          key,
          props: { value: result, ...props },
        };
      }
      if (
        result &&
        typeof result === "object" &&
        "type" in result &&
        "props" in result &&
        typeof result.type !== "undefined"
      ) {
        return result as JSXNode;
      }
    
      // 폴백하기
      return {
        type,
        key,
        props: {
          ...props,
          ...(result && typeof result === "object" ? result : {}),
          children: child,
        },
      };
    }

   // 일반적인 HTML 요소 처리
   return {
    type,
    key,
    props: {
      ...props,
      children: child,
    },
  };
}
