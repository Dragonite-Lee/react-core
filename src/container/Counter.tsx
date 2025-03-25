import { useEffect } from "../hooks/useEffect";
import { useState } from "../hooks/useState";
import { VNode } from "../type";

export default function Counter(): VNode {
  const [count, setCount] = useState<number>(0);

  // 타이머 설정: 매 초마다 콘솔에 메시지 출력
  useEffect(() => {
    console.log("Timer started");
    const timer = setInterval(() => {
      console.log("Timer tick, count:", count);
    }, 1000);

    // 클린업 함수: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      console.log("Timer cleared");
      clearInterval(timer);
    };
  }, [count]); // count가 변경될 때마다 이펙트 실행

  const handleIncrement = (e: any) => {
    console.log("Increment - Synthetic Event:", e.type, e.target);
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
  };

  const handleDecrement = (e: any) => {
    console.log("Decrement - Synthetic Event:", e.type, e.target);
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
