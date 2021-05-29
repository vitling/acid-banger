import { ProgramState, AutoPilotUnit } from "../../typings/interface";

import { genericParameter, parameter } from "../interface";
import { WanderingParameter } from "../params/wandering-parameter";

export function AutoPilot(state: ProgramState): AutoPilotUnit {
  const nextMeasure = parameter("upcomingMeasure", [0, Infinity], 0);
  const currentMeasure = parameter("measure", [0, Infinity], 0);
  const patternEnabled = genericParameter("Alter Patterns", true);
  const dialsEnabled = genericParameter("Twiddle Knobs", true);
  const mutesEnabled = genericParameter("Mute Drum Parts", true);
  state.clock.currentStep.subscribe((step) => {
    if (step === 4) {
      nextMeasure.value = nextMeasure.value + 1;
    } else if (step === 15) {
      // slight hack to get mutes functioning as expected
      currentMeasure.value = currentMeasure.value + 1;
    }
  });

  nextMeasure.subscribe((measure: number) => {
    if (patternEnabled.value) {
      if (measure % 64 === 0) {
        if (Math.random() < 0.2) {
          state.gen.newNotes.value = true;
        }
      }
      if (measure % 16 === 0) {
        state.notes.forEach((n, _i) => {
          if (Math.random() < 0.5) {
            n.newPattern.value = true;
          }
        });
        if (Math.random() < 0.3) {
          state.drums.newPattern.value = true;
        }
      }
    }
  });

  currentMeasure.subscribe((measure: number) => {
    if (mutesEnabled.value) {
      if (measure % 8 == 0) {
        const drumMutes = [
          Math.random() < 0.2,
          Math.random() < 0.5,
          Math.random() < 0.5,
          Math.random() < 0.5,
        ];
        state.drums.mutes[0].value = drumMutes[0];
        state.drums.mutes[1].value = drumMutes[1];
        state.drums.mutes[2].value = drumMutes[2];
        state.drums.mutes[3].value = drumMutes[3];
      }
    }
  });
  const noteParams = state.notes.flatMap((x) => Object.values(x.parameters));
  const delayParams = [state.delay.feedback, state.delay.dryWet];

  const wanderers = [...noteParams, ...delayParams].map((param) =>
    WanderingParameter(param)
  );
  window.setInterval(() => {
    if (dialsEnabled.value) wanderers.forEach((w) => w.step());
  }, 100);

  return {
    switches: [patternEnabled, dialsEnabled, mutesEnabled],
  };
}
