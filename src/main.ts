import App from "./App";
import { renderComponent } from "./hooks/useState";

const root = document.getElementById("root");
if (root) {
  renderComponent(App, root);
}
