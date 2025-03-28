import { useState } from "../hooks/useState";
import { SyntheticEventProps } from "../type";

export default function Todo() {
  const [todos, setTodos] = useState<
    { id: number; text: string; completed: boolean }[]
  >([]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e: SyntheticEventProps) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
  };

  const handleAddTodo = (e: SyntheticEventProps) => {
    console.log("e: ", e);
    e.preventDefault();
    if (inputValue.trim()) {
      const newTodos = [
        ...todos,
        { id: Date.now(), text: inputValue, completed: false },
      ];
      setTodos(newTodos);
      setInputValue("");
    }
  };

  const handleDeleteTodo = (id: number) => () => {
    setTodos(todos.filter((todo) => todo.id !== id));
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
        <button
          type="button"
          onClick={(e) => {
            handleAddTodo(e);
          }}
        >
          Add Todo
        </button>
        <ul>
          {todos.map((todo) => (
            <div key={todo.id}>
              <li>
                <input type="checkbox" value={todo.completed} />
                <label>
                  {todo.text}
                  <button onClick={handleDeleteTodo(todo.id)}>삭제</button>
                </label>
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
