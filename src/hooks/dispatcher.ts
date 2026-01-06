export type EffectRecord = {
  deps?: any[];
  cleanup?: void | (() => void);
};

export type HookedInstance = {
  hooks?: any[];
  effects?: EffectRecord[];
};

// 렌더러가 세팅하는 "현재 렌더 중인 함수 컴포넌트 인스턴스"
let current: HookedInstance | null = null;
let hookIndex = 0;

// 렌더러가 render 시작/끝에서 호출
export function beginHooks(inst: HookedInstance) {
  current = inst;
  hookIndex = 0;
}

export function endHooks() {
  current = null;
}

// 훅 구현에서 사용
export function getCurrentInstance() {
  if (!current)
    throw new Error("Hooks can only be called inside a function component");
  return current;
}

export function nextHookIndex() {
  return hookIndex++;
}
