import { useState } from "../hooks/useState";
import { VNode } from "../type";

export default function Counter(): VNode {
  const [count, setCount] = useState<number>(0);
  console.log('count: ', count);

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
