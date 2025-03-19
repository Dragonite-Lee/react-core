import { useState } from "../hooks/useState";

export default function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
  };
  const handleDecrement = () => {
    setCount((prev: number) => prev - 1);
  };

  return (
    <div>
      <h1>Counter Example</h1>
      <div>
        <p>Count: {count}</p>
        <button onClick={handleIncrement}>Increment</button>
        <button onClick={handleDecrement}>Decrement</button>
      </div>
    </div>
  );
}
