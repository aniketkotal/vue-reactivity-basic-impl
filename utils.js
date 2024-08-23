export function createRef(initialValue = null) {
  let value = initialValue;
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener(value));
  };

  const ref = {
    get value() {
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        notify();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return ref;
}

export function watch(refVar, callbackFn, additionalOptions = {}) {
  refVar.subscribe(callbackFn);
  if (additionalOptions.immediate) {
    callbackFn(refVar.value);
  }
}

export function createReactiveObject(obj) {
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener(obj));
  };

  const handler = {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "object" && value !== null) {
        return new Proxy(value, handler);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      notify();
      return result;
    },
  };

  const reactiveObj = new Proxy(obj, handler);

  reactiveObj.subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return reactiveObj;
}

export const computed = (fn) => {
  let cachedValue;
  let dirty = true;
  const ref = createRef();

  const evaluate = () => {
    if (dirty) {
      cachedValue = fn();
      dirty = false;
    }
    return cachedValue;
  };

  const proxy = new Proxy(ref, {
    get(target, prop, receiver) {
      if (prop === "value") {
        return evaluate();
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  ref.subscribe(() => {
    dirty = true;
  });

  return proxy;
};
