let activeEffect = null;

function setActiveEffect(effect) {
  const prevEffect = activeEffect;
  activeEffect = effect;
  return () => {
    activeEffect = prevEffect;
  };
}

export function createRef(initialValue = null) {
  let value = initialValue;
  const listeners = new Set();
  const dependents = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener(value));
    dependents.forEach((dependent) => (dependent.dirty = true));
  };

  const ref = {
    get value() {
      if (activeEffect) {
        dependents.add(activeEffect);
      }
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
    addDependent(dependent) {
      dependents.add(dependent);
    },
    removeDependent(dependent) {
      dependents.delete(dependent);
    },
  };

  return ref;
}

export function watch(source, callbackFn, additionalOptions = {}) {
  const unsubscribe = source.subscribe(callbackFn);

  if (additionalOptions.immediate) {
    callbackFn(source.value);
  }

  return unsubscribe;
}

export function createReactiveObject(obj) {
  const listeners = new Set();
  const dependents = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener(obj));
    dependents.forEach((dependent) => (dependent.dirty = true));
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

  reactiveObj.addDependent = (dependent) => {
    dependents.add(dependent);
  };

  reactiveObj.removeDependent = (dependent) => {
    dependents.delete(dependent);
  };

  return reactiveObj;
}

export const computed = (fn) => {
  let cachedValue;
  let dirty = true;
  const listeners = new Set();

  const evaluate = () => {
    if (dirty) {
      const resetEffect = setActiveEffect(computedRef);
      try {
        cachedValue = fn();
      } finally {
        resetEffect();
      }
      dirty = false;
    }
    return cachedValue;
  };

  const notify = () => {
    if (!dirty) {
      dirty = true;
      const value = evaluate();
      listeners.forEach((listener) => listener(value));
    }
  };

  const computedRef = {
    get value() {
      return evaluate();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(evaluate());
      return () => listeners.delete(listener);
    },
    addDependent(dependent) {},
    removeDependent(dependent) {},
  };

  Object.defineProperty(computedRef, "dirty", {
    set(value) {
      if (value === true && !dirty) {
        dirty = true;
        notify();
      }
    },
  });

  return computedRef;
};
