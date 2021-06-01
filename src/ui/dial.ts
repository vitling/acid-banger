/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

type DialElement = {
  element: HTMLElement;
  value: number;
  bind: (h: (v: number) => void) => void;
};

export function Dial(bounds: [number, number], text = "unlabeled"): DialElement {
  const element = document.createElement("input");
  element.type = "range";
  element.name = text;
  element.classList.add("dial");

  let normalizedValue = 0.5;

  function paint() {
    element.value = String(normalizedValue * 100);
  }

  function normalise(v: number) {
    return (v - bounds[0]) / (bounds[1] - bounds[0]);
  }

  function denormalise(n: number) {
    return bounds[0] + (bounds[1] - bounds[0]) * n;
  }

  function setValue(n: number) {
    normalizedValue = normalise(n);
    paint();
  }

  function getValue(): number {
    return denormalise(normalizedValue);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  const state = { isDragging: false, handler: [(_v: number) => {}] };

  function bind(h: (v: number) => void) {
    state.handler.push(h);
  }

  element.addEventListener("input", () => {
    const newValue = parseFloat(element.value) / 100;
    const actualValue = denormalise(newValue);
    setValue(actualValue);
    state.handler.forEach((h) => h(actualValue));
  });

  return {
    element,
    get value(): number {
      return getValue();
    },
    set value(v: number) {
      setValue(v);
    },
    bind,
  };
}
