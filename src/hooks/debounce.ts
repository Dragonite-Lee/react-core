export function debounceFrame(callback: () => void) {
  let frameId: number;
  return (...args: any[]) => {
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(() => callback());
  };
}
