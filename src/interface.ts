import {
  GeneralisedParameter,
  NumericParameter,
  ParameterCallback,
  Trigger,
} from "../typings/interface";

export function genericParameter<T>(
  name: string,
  value: T
): GeneralisedParameter<T> {
  let listeners: ParameterCallback<T>[] = [];
  const state = { value };
  function subscribe(callback: ParameterCallback<T>) {
    callback(state.value);
    listeners.push(callback);
  }

  function publish() {
    for (let l of listeners) {
      l(state.value);
    }
  }
  return {
    name,
    subscribe,
    get value() {
      return state.value;
    },
    set value(v: T) {
      state.value = v;
      publish();
    },
  };
}

export function trigger(name: string, value: boolean = false): Trigger {
  return genericParameter(name, value);
}

export function parameter(
  name: string,
  bounds: [number, number],
  value: number
): NumericParameter {
  return Object.assign(genericParameter<number>(name, value), { bounds });
}
