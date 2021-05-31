import { NoteGenerator, Pattern, ThreeOhMachine } from "@typings/interface";
import { AudioT } from "@typings/audio";

import { genericParameter, parameter, trigger } from "../interface";

export function ThreeOhUnit(
  audio: AudioT,
  waveform: OscillatorType,
  output: AudioNode,
  gen: NoteGenerator,
  patternLength = 16
): ThreeOhMachine {
  const synth = audio.ThreeOh(waveform, output);
  const pattern = genericParameter<Pattern>("Pattern", []);
  const newPattern = trigger("New Pattern Trigger", true);

  gen.newNotes.subscribe((newNotes) => {
    if (newNotes == true) newPattern.value = true;
  });

  function step(index: number) {
    if ((index === 0 && newPattern.value == true) || pattern.value.length == 0) {
      pattern.value = gen.createPattern();
      newPattern.value = false;
    }

    const slot = pattern.value[index % patternLength];
    if (slot.note != "-") {
      synth.noteOn(slot.note, slot.accent, slot.glide);
    } else {
      synth.noteOff();
    }
  }

  const parameters = {
    cutoff: parameter("Cutoff", [30, 700], 400),
    resonance: parameter("Resonance", [1, 30], 15),
    envMod: parameter("Env Mod", [0, 8000], 4000),
    decay: parameter("Decay", [0.1, 0.9], 0.5),
  };

  parameters.cutoff.subscribe((v: number) => (synth.params.cutoff.value = v));
  parameters.resonance.subscribe((v: number) => (synth.params.resonance.value = v));
  parameters.envMod.subscribe((v: number) => (synth.params.envMod.value = v));
  parameters.decay.subscribe((v: number) => (synth.params.decay.value = v));

  return {
    step,
    pattern,
    parameters,
    newPattern,
  };
}
