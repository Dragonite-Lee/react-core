export function createElement(type, config, ...children) {
  const child = (() => {
    if (children.length === 0) return undefined;
    if (children.length === 1) return children[0];
    return children; // children이 여러 개일 때 처리
  })();

  const { key = null, ...props } = config || {};

  if (typeof type === "function") {
    return type({ key, children: child, ...props });
  }

  return {
    type,
    key,
    props: {
      children: child,
      ...props,
    },
  };
}

