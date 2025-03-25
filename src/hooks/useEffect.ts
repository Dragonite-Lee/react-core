import { stateManager } from "./useState";

interface Effect {
  callback: () => void | (() => void);
  dependencies: any[] | undefined;
  cleanup?: () => void;
  lastDependencies?: any[];
}

export function useEffect(callback: () => void | (() => void), dependencies?: any[]): void {
  const key = stateManager.index;

  console.log(`Registering useEffect at index ${key}, dependencies:`, dependencies);

  const existingEffect = stateManager.effects[key] || {};
  const newEffect: Effect = {
    callback,
    dependencies,
    cleanup: existingEffect.cleanup,
    lastDependencies: existingEffect.lastDependencies,
  };

  stateManager.effects[key] = newEffect;
  console.log("stateManager after registering effect:", stateManager);

  stateManager.index++;
}

export function runEffects() {
  console.log("Running effects, total effects:", stateManager.effects.length);
  stateManager.effects.forEach((effect, index) => {
    if (!effect) return;

    const { callback, dependencies } = effect;
    const prevDependencies = effect.lastDependencies;

    console.log(`Effect at index ${index} - prevDependencies:`, prevDependencies);
    console.log(`Effect at index ${index} - current dependencies:`, dependencies);

    const isFirstRun = prevDependencies === undefined;
    const hasNoDependencies = dependencies === undefined;
    const dependenciesChanged =
      dependencies &&
      prevDependencies &&
      dependencies.some((dep, i) => dep !== prevDependencies[i]);

    const shouldRun = isFirstRun || hasNoDependencies || dependenciesChanged;

    console.log(
      `Effect at index ${index} - shouldRun: ${shouldRun}, ` +
        `isFirstRun: ${isFirstRun}, hasNoDependencies: ${hasNoDependencies}, ` +
        `dependenciesChanged: ${dependenciesChanged}`
    );

    if (shouldRun) {
      if (effect.cleanup) {
        console.log(`Running cleanup for effect at index ${index}`);
        effect.cleanup();
      }

      console.log(`Executing effect at index ${index}`);
      const cleanup = callback();
      if (typeof cleanup === "function") {
        stateManager.effects[index].cleanup = cleanup;
      } else {
        stateManager.effects[index].cleanup = undefined;
      }

      stateManager.effects[index].lastDependencies = dependencies ? [...dependencies] : undefined;
    }
  });
}
