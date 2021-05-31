import { GeneralisedParameter, NoteGenerator, Pattern, Slot, Trigger } from "@typings/interface";
import { FullNote } from "@typings/audio";

import { midiNoteToText } from "../audio";
import { choose, rndInt } from "../math";
import { genericParameter, trigger } from "../interface";

export function ThreeOhGen(): NoteGenerator {
  const noteSet: GeneralisedParameter<FullNote[]> = genericParameter("note set", ["C1"]);
  const newNotes: Trigger = trigger("new note set", true);
  const density = 1.0;

  const offsetChoices = [
    [0, 0, 12, 24, 27],
    [0, 0, 0, 12, 10, 19, 26, 27],
    [0, 1, 7, 10, 12, 13],
    [0],
    [0, 0, 0, 12],
    [0, 0, 12, 14, 15, 19],
    [0, 0, 0, 0, 12, 13, 16, 19, 22, 24, 25],
    [0, 0, 0, 7, 12, 15, 17, 20, 24],
  ];

  function changeNotes() {
    const root = rndInt(15) + 16;
    const offsets: number[] = choose(offsetChoices);
    noteSet.value = offsets.map((o) => midiNoteToText(o + root));
  }

  function createPattern(): Pattern {
    if (newNotes.value == true) {
      changeNotes();
      newNotes.value = false;
    }
    const pattern: Slot[] = [];

    for (let i = 0; i < 16; i++) {
      const chance = density * (i % 4 === 0 ? 0.6 : i % 3 === 0 ? 0.5 : i % 2 === 0 ? 0.3 : 0.1);
      if (Math.random() < chance) {
        pattern.push({
          note: choose(noteSet.value),
          accent: Math.random() < 0.3,
          glide: Math.random() < 0.1,
        });
      } else {
        pattern.push({
          note: "-",
          accent: false,
          glide: false,
        });
      }
    }

    return pattern;
  }
  return {
    createPattern,
    newNotes,
    noteSet,
  };
}
