import { DrumPattern, NineOhMachine } from "@typings/interface";
import { AudioT } from "@typings/audio";

import { genericParameter, trigger } from "../interface";
import { NineOhGen } from "../patterns";

export async function NineOhUnit(audio: AudioT): Promise<NineOhMachine> {
  const drums = await audio.SamplerDrumMachine([
    "909BD.mp3",
    "909OH.mp3",
    "909CH.mp3",
    "909SD.mp3",
  ]);
  const pattern = genericParameter<DrumPattern>("Drum Pattern", []);
  const mutes = [
    genericParameter("Mute BD", false),
    genericParameter("Mute OH", false),
    genericParameter("Mute CH", false),
    genericParameter("Mute SD", false),
  ];
  const newPattern = trigger("New Pattern Trigger", true);
  const gen = NineOhGen();

  function step(index: number) {
    if ((index == 0 && newPattern.value == true) || pattern.value.length == 0) {
      pattern.value = gen.createPatterns(true);
      newPattern.value = false;
    }
    for (const i in pattern.value) {
      const entry = pattern.value[i][index % pattern.value[i].length];
      if (entry && !mutes[i].value) {
        drums.triggers[i].play(entry);
      }
    }
  }

  return {
    step,
    pattern,
    mutes,
    newPattern,
  };
}
