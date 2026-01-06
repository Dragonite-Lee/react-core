export function debounceFrame(fn: () => void) {
  let raf = 0;
  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      fn();
    });
  };
}
