import { SyntheticEventProps } from "./type";

export class SyntheticEvent implements SyntheticEventProps {
    public nativeEvent: Event; 
    public type: string;
    public target: EventTarget | null;
    public currentTarget: EventTarget | null;
    private isPropagationStopped: boolean;
  
    constructor(nativeEvent: Event) {
      this.nativeEvent = nativeEvent;
      this.type = nativeEvent.type;
      this.target = nativeEvent.target;
      this.currentTarget = nativeEvent.currentTarget;
      this.isPropagationStopped = false;
    }
  
    stopPropagation() {
      this.isPropagationStopped = true;
      this.nativeEvent.stopPropagation();
    }
  
    preventDefault() {
      this.nativeEvent.preventDefault();
    }
  
    isDefaultPrevented(): boolean {
      return this.nativeEvent.defaultPrevented;
    }
}

export function createSyntheticEvent(event: Event): SyntheticEvent {
    return new SyntheticEvent(event);
}
