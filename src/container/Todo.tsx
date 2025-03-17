import { useState } from "../hooks/useState";

export default function Todo() {
  const [todos, setTodos] = useState<{ text: string; completed: boolean }[]>(
    []
  );
  const [inputValue, setInputValue] = useState("");
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
    if (e) e.preventDefault();
    if (inputRef) {
      inputRef.blur();
    }
  };

  const handleAddTodo = (e?: Event) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      const newTodos = [...todos, { text: inputValue, completed: false }];
      setTodos(newTodos);
      setInputValue("");
      if (inputRef) inputRef.blur(); 
    }
  };

  const handleToggleTodo = (index: number) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    setTodos(
      todos.map((todo, i) =>
        i === index ? { ...todo, completed: target.checked } : todo
      )
    );
  };

  const setInputRefCallback = (el: HTMLInputElement) => {
    if (el && !inputRef) {
      setInputRef(el);
    }
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
          ref={setInputRefCallback}
        />
        <button onClick={handleAddTodo}>Add Todo</button>
        <ul>
          {todos.map((todo, index) => (
            <li>
              <input
                type="checkbox"
                onChange={() => handleToggleTodo(index)}
                checked={todo.completed}
              />
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
