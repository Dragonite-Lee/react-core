import { useState } from "../hooks/useState";
import { JSXNode } from "../type";

export default function Counter(): JSXNode {
  const [count, setCount] = useState<number>(0);

  const handleIncrement = (e: any) => {
    setCount((prev: number) => prev + 1);
  };

  const handleDecrement = (e: any) => {
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
