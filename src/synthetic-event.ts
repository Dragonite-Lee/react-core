/**
 * @ref https://github.com/facebook/react/blob/df9dc8933387c5f1e6126ce38e95771c890f8e4f/src/renderers/shared/shared/event/SyntheticEvent.js
 *
 * @param {*} handler - ReactEventHandler
 * @callback ReactEventHandler(syntheticEvent)
 */
export function syntheticEvent(handler) {
    return (nativeEvent) => {
      const syntheticEvent = {
        nativeEvent: nativeEvent,
  
        target: nativeEvent.target,
        currentTarget: nativeEvent.currentTarget,
        type: nativeEvent.type,
  
        preventDefault: function () {
          this.defaultPrevented = true;
          if (nativeEvent.preventDefault) {
            nativeEvent.preventDefault();
          }
        },
  
        stopPropagation: function () {
          this.propagationStopped = true;
          if (nativeEvent.stopPropagation) {
            nativeEvent.stopPropagation();
          }
        },
  
        defaultPrevented:
          nativeEvent.defaultPrevented != null
            ? nativeEvent.defaultPrevented
            : nativeEvent.returnValue === false,
        propagationStopped: false,
      };
  
      handler(syntheticEvent);
    };
  }
