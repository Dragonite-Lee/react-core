import App from './App';

function render(element: any, container: HTMLElement) {
  console.log('Rendering element:', element);
  if (typeof element === 'string' || typeof element === 'number') {
    const textNode = document.createTextNode(element.toString());
    console.log('Adding text node:', textNode.textContent);
    container.appendChild(textNode);
    console.log('Added text node to:', container);
    return;
  }
  if (!element || typeof element !== 'object' || !element.type) {
    console.warn('Invalid element:', element);
    return;
  }
  const dom = document.createElement(element.type);
  console.log('Created DOM:', dom);
  if (element.props) {
    for (const [key, value] of Object.entries(element.props)) {
      console.log('Processing prop:', key, value);
      if (key === 'children') {
        console.log('Processing children:', value);
        if (Array.isArray(value)) {
          value.forEach((child, index) => {
            console.log(`Rendering child ${index}:`, child);
            if (child && typeof child === 'object' && 'type' in child) {
              render(child, dom);
            } else if (typeof child === 'string' || typeof child === 'number') {
              render(child, dom);
            } else {
              console.warn(`Invalid child at index ${index}:`, child);
            }
          });
        } else if (value !== null && value !== undefined) {
          console.log('Rendering single child:', value);
          render(value, dom);
        } else {
          console.warn('Children is null or undefined:', value);
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        dom.setAttribute(key, value.toString());
        console.log(`Set attribute ${key}=${value}`);
      }
    }
  }
  console.log('Appending to container:', dom.outerHTML);
  container.appendChild(dom);
  console.log('Appended to:', container.outerHTML);
}

document.addEventListener('DOMContentLoaded', () => {
  const appElement = App();
  console.log('Virtual DOM:', JSON.stringify(appElement, null, 2));
  const root = document.getElementById('root');
  console.log('Root element:', root);
  if (root) {
    console.log('Starting render...');
    render(appElement, root);
  } else {
    console.error('Root element not found!');
  }
});