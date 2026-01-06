import Counter from "./container/Counter";
import Todo from "./container/Todo";
import { jsx as _jsx, jsxs as _jsxs } from "./custom-jsx/jsx-runtime";
import { ReactNode } from "./type";

export default function App(): ReactNode {
  return (
    <div id="app">
      {/* 카운터 */}
      <Counter />

      {/* TODO */}
      <Todo />
    </div>
  );
}
