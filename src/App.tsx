import Counter from "./container/Counter";
import Todo from "./container/Todo";
import { jsx as _jsx, jsxs as _jsxs } from "./custom-jsx/jsx-runtime";
import { JSXNode } from "./type/index";

export default function App(): JSXNode {
  return (
    <div id="app">
      {/* 카운터 */}
      {/* <Counter /> */}

      {/* TODO */}
      {/* <Todo /> */}
      <h1>hello</h1>
      <div>
        <p>안녕</p>
      </div>
    </div>
  );
}
