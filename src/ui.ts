/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

import {
  DelayUnit,
  GeneralisedParameter,
  NoteGenerator,
  ProgramState,
  Trigger,
  AutoPilotUnit,
} from "@typings/interface";

import "./ui.css";

import { DrumDisplay } from "./ui/drum-display";

import { PatternDisplay } from "./ui/pattern-display";
import { AudioMeter } from "./ui/audio-meter";
import { DialSet } from "./ui/dial-set";

function triggerButton(target: Trigger) {
  const but = document.createElement("button");
  but.classList.add("trigger-button");
  but.innerText = "⟳";

  target.subscribe((v) => {
    if (v) but.classList.add("waiting");
    else but.classList.remove("waiting");
  });

  but.addEventListener("click", function () {
    target.value = true;
  });

  return but;
}

function toggleButton(param: GeneralisedParameter<boolean>, ...classes: string[]) {
  const button = document.createElement("button");
  button.classList.add(...classes);
  button.innerText = param.name;
  button.addEventListener("click", () => (param.value = !param.value));
  param.subscribe((v) => {
    if (v) {
      button.classList.add("on");
      button.classList.remove("off");
    } else {
      button.classList.add("off");
      button.classList.remove("on");
    }
  });
  return button;
}

function label(text: string) {
  const element = document.createElement("div");
  element.classList.add("label");
  element.innerText = text;
  return element;
}

function machine(...contents: HTMLElement[]) {
  const element = document.createElement("div");
  element.classList.add("machine");
  element.append(...contents);
  return element;
}

function controlGroup(label: HTMLElement, content: HTMLElement, ...classes: string[]) {
  const element = document.createElement("div");
  element.classList.add("control-group", ...classes);
  element.append(label, content);
  return element;
}

function controls(...contents: HTMLElement[]) {
  const element = document.createElement("div");
  element.classList.add("controls");
  element.append(...contents);
  return element;
}

function group(...contents: HTMLElement[]) {
  const element = document.createElement("div");
  element.classList.add("group");
  element.append(...contents);
  return element;
}

function NoteGen(noteGenerator: NoteGenerator) {
  const currentNotes = document.createElement("div");
  currentNotes.classList.add("parameter-controlled", "notegen-note-display");
  noteGenerator.noteSet.subscribe((notes) => {
    currentNotes.innerText = notes.join(", ");
  });

  return controlGroup(
    label("Notegen"),
    group(triggerButton(noteGenerator.newNotes), currentNotes),
    "notegen-box"
  );
}

function Mutes(params: GeneralisedParameter<boolean>[]) {
  const container = document.createElement("div");
  container.classList.add("mutes");

  container.append(...params.map((p) => toggleButton(p)));
  return container;
}

function DelayControls(delayUnit: DelayUnit) {
  const controls = DialSet([delayUnit.dryWet, delayUnit.feedback]);
  controls.classList.add("horizontal");

  return controlGroup(label("Delay"), controls);
}

function AutopilotControls(autoPilot: AutoPilotUnit) {
  return controlGroup(
    label("Autopilot"),
    group(...autoPilot.switches.map((p) => toggleButton(p, "autopilot-button")))
  );
}

export function UI(
  state: ProgramState,
  autoPilot: AutoPilotUnit,
  analyser: AnalyserNode
): HTMLDivElement {
  const ui = document.createElement("div");
  ui.id = "ui";

  const otherControls = controls(
    AutopilotControls(autoPilot),
    NoteGen(state.gen),
    DelayControls(state.delay),
    controlGroup(label("Clock"), DialSet([state.clock.bpm], "horizontal")),
    controlGroup(label("Volume"), DialSet([state.masterVolume], "horizontal")),
    controlGroup(label("Meter"), group(AudioMeter(analyser)), "meter")
  );

  const machineContainer = document.createElement("div");
  machineContainer.classList.add("machines");

  // TODO use state.notes pubsub to connect MIDI dials to note.parameters

  const noteMachines = state.notes.map((n, i) =>
    machine(
      label("303-0" + (i + 1)),
      group(
        triggerButton(n.newPattern),
        PatternDisplay(n.pattern, state.clock.currentStep),
        DialSet(n.parameters)
      )
    )
  );

  const drumMachine = machine(
    label("909-XX"),
    group(
      triggerButton(state.drums.newPattern),
      DrumDisplay(state.drums.pattern, state.drums.mutes, state.clock.currentStep),
      Mutes(state.drums.mutes)
    )
  );

  machineContainer.append(...noteMachines, drumMachine);
  ui.append(machineContainer, otherControls);

  return ui;
}
