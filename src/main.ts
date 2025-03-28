import App from "./App";
import { renderComponent } from "./hooks";


const rootElement = document.getElementById("root");
if (rootElement) {
  renderComponent(App, rootElement);
}
