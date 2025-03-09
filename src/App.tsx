import createElement from './createElement';

const Header = () => <h1 id="header">Hello, JSX Clone!</h1>;
const Content = () => (
  <div id="content">
    <p>This is a simple clone.</p>
    <span>Nested span</span>
  </div>
);

const App = () => {
  return (
    <div id="app">
      <h1>Hello</h1>
      <div>
        <p>Nested 1</p>
        <p>Nested 2</p>
      </div>
      <Header />
      <Content />
    </div>
  );
};

export default App;