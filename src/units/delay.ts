import { DelayUnit } from "../../typings/interface";

import { AudioT } from "../audio";
import { parameter } from "../interface";

export function DelayUnit(audio: AudioT): DelayUnit {
  const dryWet = parameter("Dry/Wet", [0, 0.5], 0.5);
  const feedback = parameter("Feedback", [0, 0.9], 0.3);
  const delayTime = parameter("Time", [0, 2], 0.3);
  const delay = audio.DelayInsert(
    delayTime.value,
    dryWet.value,
    feedback.value
  );
  dryWet.subscribe((w: number) => (delay.wet.value = w));
  feedback.subscribe((f: number) => (delay.feedback.value = f));
  delayTime.subscribe((t: number) => (delay.delayTime.value = t));

  return {
    dryWet,
    feedback,
    delayTime,
    inputNode: delay.in,
  };
}
