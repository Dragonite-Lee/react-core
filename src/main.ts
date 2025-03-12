import App from "./App";
import render from "./render";

const appElement = App();
console.log("가상돔 생성:", JSON.stringify(appElement, null, 2));
const root = document.getElementById("root");
if (root) {
  render(appElement, root);
}
