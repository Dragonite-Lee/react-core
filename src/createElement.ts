export default function createElement(
  type: string | ((props: any) => any),
  props: Record<string, any> | null,
  ...children: any[]
) {
  if (typeof type === 'function') {
    const result = type(props || {});
    console.log('Function component result:', result);
    if (result && typeof result === 'object' && 'type' in result) {
      return {
        ...result,
        children: result.children ? [...result.children, ...children] : children,
      };
    }
    console.warn('Invalid Virtual DOM from function component:', result);
    return { type: type.name, props: result || {}, children };
  }
  return { type, props: props || {}, children };
}