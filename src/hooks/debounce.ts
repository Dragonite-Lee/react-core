export const debounceFrame = (callback: () => void) => {
    let nextFrameCallback = -1;
    return () => {
      cancelAnimationFrame(nextFrameCallback);
      nextFrameCallback = requestAnimationFrame(() => {
        callback();
        nextFrameCallback = -1; 
      });
    };
  };
