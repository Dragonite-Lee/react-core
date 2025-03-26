// createElement 사용
export interface JSXProps {
  key?: string | null;
  children?: any;
  [key: string]: any;
}

export type ElementType = string | ((props: JSXProps) => any);

export interface JSXNode {
  type: ElementType;
  key: string | null;
  props: JSXProps;
}

// renderer
export type JSXElement = JSXNode | string | number | boolean | null | undefined;

export type JSX = (type: ElementType, config: JSXProps, key?: Key) => any;
export type Key = string | number | bigint | undefined;

// type Props = {
//   [key: string]:
//     | string
//     | number
//     | Function
//     | JSXNode
//     | JSXNode[]
//     | (string | number | JSXNode)[]
//     | undefined;
//   children?: string | number | JSXNode | (string | number | JSXNode)[];
// };



export type SetStateAction<T> = T | ((prev: T) => T);

