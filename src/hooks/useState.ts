import { getCurrentInstance, nextHookIndex } from "./dispatcher";
import { scheduleUpdate } from "../render";

export type SetStateAction<T> = T | ((prev: T) => T);

export function useState<T>(
  initial: T | (() => T)
): [T, (a: SetStateAction<T>) => void] {
  const inst = getCurrentInstance();
  inst.hooks ??= [];

  const idx = nextHookIndex();

  if (inst.hooks[idx] === undefined) {
    inst.hooks[idx] =
      typeof initial === "function" ? (initial as any)() : initial;
  }

  const setState = (action: SetStateAction<T>) => {
    const prev = inst.hooks![idx] as T;
    const next = typeof action === "function" ? (action as any)(prev) : action;

    if (Object.is(prev, next)) return;

    inst.hooks![idx] = next;
    scheduleUpdate(); // 루트부터 reconcile (React도 결국 스케줄링함)
  };

  return [inst.hooks[idx] as T, setState];
}
