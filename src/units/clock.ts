import { ClockUnit } from "../../typings/interface";

import { Clock } from "../boilerplate";
import { parameter } from "../interface";

export function ClockUnit(): ClockUnit {
  const bpm = parameter("BPM", [70, 200], 125);
  const currentStep = parameter("Current Step", [0, 15], 0);
  const clockImpl = Clock(bpm.value, 4, 0.0);
  bpm.subscribe(clockImpl.setBpm);
  clockImpl.bind((_time, step) => {
    currentStep.value = step % 16;
  });
  return {
    bpm,
    currentStep,
  };
}
