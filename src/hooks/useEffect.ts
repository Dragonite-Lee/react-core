import { getCurrentInstance, nextHookIndex } from "./dispatcher";
import { pushPendingEffect } from "../render";

export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  const inst = getCurrentInstance();
  inst.effects ??= [];

  const idx = nextHookIndex();
  const prev = inst.effects[idx];
  const prevDeps = prev?.deps;

  const changed =
    deps === undefined ||
    !prevDeps ||
    deps.length !== prevDeps.length ||
    deps.some((d, i) => !Object.is(d, prevDeps[i]));

  inst.effects[idx] = { ...prev, deps };

  if (changed) {
    pushPendingEffect(inst, idx, effect);
  }
}
