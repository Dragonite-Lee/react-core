import { render } from "./render";
import createElement from "./createElement";
import App from "./App";

const root = document.getElementById("root");
if (root) {
  render(createElement(App, {}), root);
}
