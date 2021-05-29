/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

import { FullNote } from "../src/audio.js";

export type Slot = {
  note: FullNote | "-";
  accent: boolean;
  glide: boolean;
};

export type Pattern = Slot[];

export type DrumPattern = number[][];
type ParameterCallback<T> = (v: T) => any;

export type GeneralisedParameter<T> = {
  value: T;
  name: string;
  subscribe: (callback: ParameterCallback<T>) => any;
};

export type Trigger = GeneralisedParameter<boolean>;

export type NumericParameter = GeneralisedParameter<number> & {
  bounds: [number, number];
};

export type PatternParameter = GeneralisedParameter<Pattern>;

export type ThreeOhMachine = {
  pattern: GeneralisedParameter<Pattern>;
  newPattern: Trigger;
  step: (step: number) => void;
  parameters: {
    cutoff: NumericParameter;
    resonance: NumericParameter;
    envMod: NumericParameter;
    decay: NumericParameter;
  };
};

export type NineOhMachine = {
  pattern: GeneralisedParameter<DrumPattern>;
  newPattern: Trigger;
  mutes: GeneralisedParameter<boolean>[];
  step: (step: number) => void;
};

export type NoteGenerator = {
  noteSet: GeneralisedParameter<FullNote[]>;
  newNotes: Trigger;
  createPattern: () => Pattern;
};

export type DelayUnit = {
  dryWet: NumericParameter;
  feedback: NumericParameter;
  delayTime: NumericParameter;
  inputNode: AudioNode;
  // outputNode: AudioNode
};

export type ClockUnit = {
  currentStep: NumericParameter;
  bpm: NumericParameter;
};

export type AutoPilotUnit = {
  switches: GeneralisedParameter<boolean>[];
};

export type ProgramState = {
  notes: ThreeOhMachine[];
  drums: NineOhMachine;
  gen: NoteGenerator;
  delay: DelayUnit;
  clock: ClockUnit;
  masterVolume: NumericParameter;
};
