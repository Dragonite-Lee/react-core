// import { useState } from "../hooks/useState";

// export default function Todo() {
//   const [todos, setTodos] = useState<
//     { id: number; text: string; completed: boolean }[]
//   >([]);
//   const [inputValue, setInputValue] = useState<string>("");
//   const handleInputChange = (e: Event) => {
//     const target = e.target as HTMLInputElement;
//     setInputValue(target.value);
//   };

//   const handleAddTodo = () => {
//     if (inputValue.trim()) {
//       const newTodos = [
//         ...todos,
//         { id: Date.now(), text: inputValue, completed: false },
//       ];
//       setTodos(newTodos);
//       setInputValue("");
//     }
//   };

//   const handleDeleteTodo = (id: number) => () => {
//     setTodos(todos.filter((todo) => todo.id !== id));
//   };

//   const handleToggleTodo = (id: number) => () => {
//     setTodos(
//       todos.map((todo) =>
//         todo.id === id ? { ...todo, completed: !todo.completed } : todo
//       )
//     );
//   };

//   return (
//     <div>
//       <h1>TODO List</h1>
//       <div>
//         <input
//           type="text"
//           value={inputValue}
//           onChange={handleInputChange}
//           placeholder="Add todo"
//         />
//         <button onClick={handleAddTodo}>Add Todo</button>
//         <ul>
//           {todos.map((todo) => (
//             <div>
//               <li key={todo.id}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={todo.completed}
//                     onClick={handleToggleTodo(todo.id)}
//                   />
//                   {todo.text}
//                   <button onClick={handleDeleteTodo(todo.id)}>삭제</button>
//                 </label>
//               </li>
//             </div>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }
