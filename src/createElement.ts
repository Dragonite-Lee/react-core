export default function createElement(
  type: string,
  props: Record<string, any> | null,
  ...children: any[]
) {
  return { type, props: props || {}, children };
}
