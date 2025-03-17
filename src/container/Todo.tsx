import { useState } from "../hooks/useState";

export default function Todo() {
  const [todos, setTodos] = useState<{ text: string; completed: boolean }[]>(
    []
  );
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
  };

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      const newTodos = [...todos, { text: inputValue, completed: false }];
      setTodos(newTodos);
      setInputValue("");
    }
  };

  const handleToggleTodo = (index: number) => () => {
    setTodos(
      todos.map((todo, i) =>
        i === index ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div>
      <h1>TODO List</h1>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add todo"
        />
        <button onClick={handleAddTodo}>Add Todo</button>
        <ul>
          {todos.map((todo, index) => (
            <li onClick={handleToggleTodo(index)}>
              <input type="checkbox" checked={todo.completed} />
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
