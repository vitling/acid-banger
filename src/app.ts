/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

import { ProgramState } from "@typings/interface";

import { pressToStart } from "./boilerplate";
import { Audio } from "./audio";
import { DelayUnit, ThreeOhUnit, NineOhUnit, ClockUnit, AutoPilot } from "./units";
import { ThreeOhGen } from "./patterns";
import { UI } from "./ui";

import { parameter } from "./interface";

async function start() {
  const audio = Audio();
  const clock = ClockUnit();
  const delay = DelayUnit(audio);

  clock.bpm.subscribe((b) => (delay.delayTime.value = (3 / 4) * (60 / b)));

  const gen = ThreeOhGen();
  const programState: ProgramState = {
    notes: [
      ThreeOhUnit(audio, "sawtooth", delay.inputNode, gen),
      ThreeOhUnit(audio, "square", delay.inputNode, gen),
    ],
    drums: await NineOhUnit(audio),
    gen,
    delay,
    clock,
    masterVolume: parameter("Volume", [0, 1], 0.5),
  };

  programState.masterVolume.subscribe((newVolume) => {
    audio.master.in.gain.value = newVolume;
  });

  clock.currentStep.subscribe((step) =>
    [...programState.notes, programState.drums].forEach((d) => d.step(step))
  );

  const autoPilot = AutoPilot(programState);
  const ui = UI(programState, autoPilot, audio.master.analyser);

  document.body.append(ui);
}

pressToStart(
  start,
  "The Endless Acid Banger",
  "A collaboration between human and algorithm by Vitling"
);
