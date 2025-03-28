import { stateManager, getComponentState } from "./core";

interface Effect {
  callback: () => void | (() => void);
  dependencies: any[] | undefined;
  cleanup?: () => void;
  lastDependencies?: any[];
}

export function useEffect(
  callback: () => void | (() => void),
  dependencies?: any[]
): void {
  const componentState = getComponentState(stateManager.currentComponent!);
  const key = componentState.index;

  const existingEffect = componentState.effects[key] || {
    callback: () => {},
    dependencies: undefined,
    cleanup: undefined,
    lastDependencies: undefined,
  };
  const newEffect: Effect = {
    callback,
    dependencies,
    cleanup: existingEffect.cleanup,
    lastDependencies: existingEffect.lastDependencies,
  };

  componentState.effects[key] = newEffect;
  componentState.index++;
}
