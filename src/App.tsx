import { jsx as _jsx, jsxs as _jsxs } from "./custom-jsx/jsx-runtime";

function Header() {
  return (
    <header>
      <h1>My React Core</h1>
    </header>
  );
}
const Content = () => (
  <div id="content">
    <p>This is a content.</p>
    <span>하위 span</span>
  </div>
);

export default function App() {
  return (
    <div id="app">
      <h1>Hello</h1>
      <div>
        <p>하위1</p>
        <p>하위2</p>
      </div>
      <Header />
      <Content />
    </div>
  );
}
