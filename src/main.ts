import App from "./App";
import { createRoot } from "./create-root.js";

const root = createRoot(document.getElementById("root"));
// render는 App컴포넌트를 받아서 새롭게 호출한 component를 App에 삽입하게 된다.
root.render(App);
