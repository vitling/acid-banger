import { NumericParameter } from "@typings/interface";

import { Dial } from "./dial";

export function DialSet(
  parameters: { [key: string]: NumericParameter } | NumericParameter[],
  ...classes: string[]
): HTMLDivElement {
  const params = Array.isArray(parameters)
    ? parameters
    : Object.keys(parameters).map((k) => parameters[k]);

  const container = document.createElement("div");
  container.classList.add("params", ...classes);

  params.forEach((param) => {
    //const param = parameters[p];
    const dial = Dial(param.bounds, param.name);

    // Change the parameter if we move the dial
    dial.bind((v: number) => {
      param.value = v;
    });

    // Move the dial if the parameter changes elsewhere
    param.subscribe((v: number) => (dial.value = v));

    container.append(dial.element);
  });

  return container;
}
