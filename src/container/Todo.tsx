import { useState } from "../hooks/useState";

export default function Todo() {
  const [todos, setTodos] = useState<{ text: string; completed: boolean }[]>(
    []
  );

  console.log("todos: ", todos);
  const [inputValue, setInputValue] = useState("");

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    console.log("target: ", target.value);
    setInputValue(target.value);
  };

  const handleAddTodo = (e?: Event) => {
    if (e) e.preventDefault(); 

    if (inputValue.trim()) {
      if (inputRef) {
        inputRef.blur();
      }

      const newTodos = [...todos, { text: inputValue, completed: false }];
      setTodos(newTodos);
      setInputValue("");
    }
  };

  const handleToggleTodo = (index: number) => {
    setTodos(
      todos.map((todo, i) =>
        i === index ? { ...todo, completed: !todo.completed } : todo
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
                checked={todo.completed}
                onChange={() => handleToggleTodo(index)}
              />
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
