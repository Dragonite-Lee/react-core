import App from './App';

function render(element: any, container: HTMLElement) {
  if (typeof element === 'string') {
    container.appendChild(document.createTextNode(element));
    return;
  }
  const dom = document.createElement(element.type);
  if (element.props) {
    for (const [key, value] of Object.entries(element.props) as [string, any][]) {
      if (key === 'children') {
        value.forEach((child: any) => render(child, dom));
      } else {
        dom.setAttribute(key, value as string); 
      }
    }
  }
  container.appendChild(dom);
}

const appElement = App();
console.log(appElement);
const root = document.getElementById('root');
if (root) {
  render(appElement, root);
}