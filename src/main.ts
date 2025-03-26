import App from "./App";
import createElement from "./createElement";
import { createRoot } from "./render";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(createElement(App));
}
