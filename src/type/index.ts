export interface jsxProps {
  children?: any;
  [key: string]: any;
}

export interface JSXNode {
  type: ElementType;
  config: jsxProps;
  key: Key;
}
export type ElementType = string | Function;
export type JSXElement = JSXNode | string | number | boolean | null | undefined;

export type JSX = (type: ElementType, config: jsxProps, key?: Key) => any;
export type Key = string | number | bigint | undefined;

type Props = {
  [key: string]:
    | string
    | number
    | Function
    | VNode
    | VNode[]
    | (string | number | VNode)[]
    | undefined;
  children?: string | number | VNode | (string | number | VNode)[];
};

export type VNode = {
  useState<T extends {}>(initialValue: T): [T, (newValue: SetStateAction<T>) => void];
  type: string;
  props?: Props;
};

export type SetStateAction<T> = T | ((prev: T) => T);

