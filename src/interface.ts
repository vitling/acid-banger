/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

import {FullNote} from "./audio.js";
export type Slot = {
    note: FullNote | "-";
    accent: boolean,
    glide: boolean
}

export type Pattern = Slot[]

export type DrumPattern = number[][];
type ParameterCallback<T> = (v: T) => any;

export type GeneralisedParameter<T> = {
    value: T,
    name: string,
    subscribe: (callback: ParameterCallback<T>) => any
}

export type Trigger = GeneralisedParameter<boolean>

export type NumericParameter = GeneralisedParameter<number> & {
    bounds: [number,number]
}

export type PatternParameter = GeneralisedParameter<Pattern>;

export type ThreeOhMachine = {
    pattern: GeneralisedParameter<Pattern>,
    newPattern: Trigger
    step: (step: number) => void
    parameters: {
        cutoff: NumericParameter,
        resonance: NumericParameter,
        envMod: NumericParameter,
        decay: NumericParameter
    }
}

export type NineOhMachine = {
    pattern: GeneralisedParameter<DrumPattern>,
    newPattern: Trigger,
    mutes: GeneralisedParameter<boolean>[],
    step: (step: number) => void
}

export type NoteGenerator = {
    noteSet: GeneralisedParameter<FullNote[]>
    newNotes: Trigger
    createPattern: () => Pattern
}

export type DelayUnit = {
    dryWet: NumericParameter,
    feedback: NumericParameter,
    delayTime: NumericParameter,
    inputNode: AudioNode,
    // outputNode: AudioNode
}


export type ClockUnit = {
    currentStep: NumericParameter,
    bpm: NumericParameter
}

export type AutoPilotUnit = {
    switches: GeneralisedParameter<boolean>[]
}

export function genericParameter<T>(name: string, value: T): GeneralisedParameter<T> {
    let listeners: ParameterCallback<T>[] = [];
    const state = {value};
    function subscribe(callback: ParameterCallback<T>) {
        callback(state.value);
        listeners.push(callback);
    }

    function publish() {
        for (let l of listeners) {
            l(state.value);
        }
    }
    return {
        name,
        subscribe,
        get value() { return state.value; },
        set value(v: T) { state.value = v; publish(); }
    }
}

export function trigger(name: string, value: boolean = false): Trigger {
    return genericParameter(name, value);
}

export function parameter(name: string, bounds: [number, number], value: number): NumericParameter {
    return Object.assign(genericParameter<number>(name, value), {bounds});
}

export type ProgramState = {
    notes: ThreeOhMachine[],
    drums: NineOhMachine,
    gen: NoteGenerator,
    delay: DelayUnit
    clock: ClockUnit,
    masterVolume: NumericParameter
}
