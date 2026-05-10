type Callback = (payload: any) => void;

class EmergencyEventBus {
  private observers: { [event: string]: Callback[] } = {};

  constructor() { this.observers = {}; }

  subscribe(event: string, cb: Callback) {
    if (!this.observers[event]) this.observers[event] = [];
    this.observers[event].push(cb);
    return () => { this.observers[event] = this.observers[event].filter(o => o !== cb); };
  }

  broadcast(event: string, payload: any) {
    (this.observers[event] || []).forEach(cb => cb(payload));
  }
}

export const eventBus = new EmergencyEventBus();
