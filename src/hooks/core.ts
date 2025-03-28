import { createRoot } from "../render";
import { JSXNode, SetStateAction } from "../type";

interface Effect {
  callback: () => void | (() => void);
  dependencies: any[] | undefined;
  cleanup?: () => void;
  lastDependencies?: any[];
}

interface ComponentState {
  states: any[];
  index: number;
  pendingUpdates: Record<number, SetStateAction<any>[]>;
  effects: Effect[];
}

interface StateManager {
  components: Map<() => JSXNode, ComponentState>;
  currentComponent: () => JSXNode | null;
  root: ReturnType<typeof createRoot> | null;
}

export const stateManager: StateManager = {
  components: new Map(),
  currentComponent: null,
  root: null,
};

export const getComponentState = (component: () => JSXNode): ComponentState => {
  if (!stateManager.components.has(component)) {
    stateManager.components.set(component, {
      states: [],
      index: 0,
      pendingUpdates: {},
      effects: [],
    });
  }
  return stateManager.components.get(component)!;
};

export const applyPendingUpdates = (component: () => JSXNode) => {
  const componentState = getComponentState(component);
  for (const [key, updates] of Object.entries(componentState.pendingUpdates)) {
    const index = Number(key);
    let currentState = componentState.states[index];
    if (currentState === undefined) {
      currentState = updates[0];
    }
    updates.forEach((update, i) => {
      currentState =
        typeof update === "function"
          ? (update as (prev: any) => any)(currentState)
          : update;
    });
    componentState.states[index] = currentState;
  }
  componentState.pendingUpdates = {};
};

export const rerender = (component: () => JSXNode) => {
  stateManager.currentComponent = component;
  applyPendingUpdates(component);
  const componentState = getComponentState(component);
  componentState.index = 0;

  const newVNode = component();
  if (stateManager.root) {
    stateManager.root.render(newVNode);
  }

  runEffects(component);
};

export const runEffects = (component: () => JSXNode) => {
  const componentState = getComponentState(component);
  componentState.effects.forEach((effect, index) => {
    if (!effect) return;

    const { callback, dependencies } = effect;
    const prevDependencies = effect.lastDependencies;

    const isFirstRun = prevDependencies === undefined;
    const hasNoDependencies = dependencies === undefined;
    const dependenciesChanged =
      dependencies &&
      prevDependencies &&
      dependencies.some((dep, i) => dep !== prevDependencies[i]);

    const shouldRun = isFirstRun || hasNoDependencies || dependenciesChanged;

    if (shouldRun) {
      if (effect.cleanup) {
        effect.cleanup();
      }

      const cleanup = callback();
      if (typeof cleanup === "function") {
        componentState.effects[index].cleanup = cleanup;
      } else {
        componentState.effects[index].cleanup = undefined;
      }

      componentState.effects[index].lastDependencies = dependencies ? [...dependencies] : undefined;
    }
  });
};

export const renderComponent = (component: () => JSXNode, container: HTMLElement): void => {
  stateManager.currentComponent = component;
  stateManager.root = createRoot(container);
  const componentState = getComponentState(component);
  componentState.states = [];
  componentState.index = 0;
  componentState.effects = [];
  rerender(component);
};
