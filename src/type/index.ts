export const REACT_ELEMENT_TYPE = Symbol.for("react.element");
export const REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");

export type Key = string | number | null;
export type Ref = any;

export type FunctionComponent<P = any> = (props: P) => ReactNode;

export type ElementType = string | FunctionComponent<any> | symbol;

export type ReactText = string | number;
export type ReactNode =
  | ReactElement
  | ReactText
  | boolean
  | null
  | undefined
  | ReactNode[]; 

export interface JSXProps {
  children?: ReactNode;
  [key: string]: any;
}

export type ReactElement = {
  $$typeof: symbol;
  type: ElementType;
  key: Key;
  ref: Ref;
  props: JSXProps;
};

export type JSXRuntimeFn = (
  type: ElementType,
  config: any,
  key?: Key
) => ReactElement;
