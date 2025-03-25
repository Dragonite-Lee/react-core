// import render from "../render";
// import { SetStateAction, VNode } from "../type";
// import { debounceFrame } from "./debounce";
// import { runEffects } from "./useEffect"; // useEffect에서 runEffects 가져오기

// interface StateManager {
//   states: any[];
//   effects: Array<{ callback: () => void | (() => void); dependencies?: any[]; cleanup?: () => void; lastDependencies?: any[] }>;
//   index: number;
//   pendingUpdates: Record<number, SetStateAction<any>[]>;
//   component: () => VNode;
//   container: HTMLElement;
// }

// export const stateManager: StateManager = {
//   states: [],
//   effects: [],
//   index: 0,
//   pendingUpdates: {},
//   component: () => ({} as VNode),
//   container: document.createElement("div"),
// };

// const applyPendingUpdates = () => {
//   console.log("Applying pending updates:", stateManager.pendingUpdates);
//   for (const [key, updates] of Object.entries(stateManager.pendingUpdates)) {
//     let currentState = stateManager.states[Number(key)];
//     updates.forEach((update) => {
//       currentState =
//         typeof update === "function"
//           ? (update as (prev: any) => any)(currentState)
//           : update;
//     });
//     stateManager.states[Number(key)] = currentState;
//   }
//   stateManager.pendingUpdates = {};
// };

// const rerender = () => {
//   console.log("Rerendering...");
//   applyPendingUpdates();
//   stateManager.index = 0;

//   const newVNode = stateManager.component();
//   render(newVNode, stateManager.container);

//   runEffects(); // 리렌더링 후 이펙트 실행
// };

// const debouncedRerender = debounceFrame(rerender);

// export function useState<T>(
//   initialValue: T
// ): [T, (newValue: SetStateAction<T>) => void] {
//   const key = stateManager.index;

//   if (stateManager.states.length === key) {
//     stateManager.states.push(initialValue);
//   }

//   const state = stateManager.states[key];

//   const setState = (newValue: SetStateAction<T>) => {
//     console.log(`Setting state at index ${key}:`, newValue);
//     stateManager.pendingUpdates[key] = stateManager.pendingUpdates[key] || [];
//     stateManager.pendingUpdates[key].push(newValue);
//     debouncedRerender();
//   };

//   stateManager.index++;
//   return [state, setState];
// }

// export function renderComponent(component: () => VNode, container: HTMLElement): void {
//   console.log("Rendering component...");
//   stateManager.component = component;
//   stateManager.container = container;
//   stateManager.states = [];
//   stateManager.index = 0;
//   rerender();
// }
