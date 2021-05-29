/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

import { biRnd } from "./math";

export type Note =
  | "A"
  | "A#"
  | "B"
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#";
export type Octave = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type FullNote = `${Note}${Octave}`;

const lookupTable: Map<Note, number> = new Map<Note, number>();
const revLook: Map<number, Note> = new Map<number, Note>();
(() => {
  function add(note: Note, n: number) {
    lookupTable.set(note, n);
    revLook.set(n, note);
  }
  add("A", 9);
  add("A#", 10);
  add("B", 11);
  add("C", 0);
  add("C#", 1);
  add("D", 2);
  add("D#", 3);
  add("E", 4);
  add("F", 5);
  add("F#", 6);
  add("G", 7);
  add("G#", 8);
})();

export function textNoteToNumber(note: FullNote) {
  const o: Octave = note.substring(note.length - 1) as Octave;
  const n: Note = note.substring(0, note.length - 1) as Note;

  // @ts-ignore
  return parseInt(o) * 12 + lookupTable.get(n) + 12;
}

function midiNoteToFrequency(noteNumber: number) {
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

export function midiNoteToText(note: number): FullNote {
  const octave = Math.floor(note / 12);
  const n = Math.floor(note % 12);
  const noteName = revLook.get(n) as Note;
  return `${noteName}${octave}` as FullNote;
}

export function pitch(note: FullNote | number) {
  if (typeof note === "number") {
    return midiNoteToFrequency(note);
  } else {
    return midiNoteToFrequency(textNoteToNumber(note));
  }
}

// @ts-ignore
export function Audio(
  au: AudioContext = new (window.AudioContext || window.webkitAudioContext)()
) {
  function masterChannel() {
    const gain = au.createGain();
    gain.gain.value = 0.5;
    const limiter = au.createDynamicsCompressor();
    limiter.attack.value = 0.005;
    limiter.release.value = 0.1;
    limiter.ratio.value = 15.0;
    limiter.knee.value = 0.0;
    limiter.threshold.value = -0.5;

    const analyser = au.createAnalyser();
    analyser.fftSize = 2048;
    limiter.connect(analyser);

    gain.connect(limiter);
    limiter.connect(au.destination);

    return {
      in: gain,
      analyser,
    };
  }

  function constantSourceCompatible(): AudioNode & {
    offset: AudioParam;
    start: () => void;
  } {
    if (au.createConstantSource) {
      return au.createConstantSource();
    } else {
      const src = au.createBufferSource();
      src.buffer = au.createBuffer(1, 256, au.sampleRate);
      const array = src.buffer.getChannelData(0);
      for (let i = 0; i < array.length; i++) {
        array[i] = 1.0;
      }
      const gain = au.createGain();
      const offsetParam = gain.gain;
      src.loop = true;
      src.connect(gain);
      return Object.assign(gain, {
        offset: offsetParam,
        start: () => src.start(),
      });
    }
  }

  function decodeAudioDataCompatible(
    audioData: ArrayBuffer
  ): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      return au.decodeAudioData(audioData, resolve, reject);
    });
  }

  const master = masterChannel();

  function time(s: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), s * 1000);
    });
  }

  async function tone(
    pitch: number,
    attack: number,
    sustain: number,
    release: number,
    pan: number = 0.0,
    destination: AudioNode = master.in
  ) {
    const osc = au.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = pitch;
    osc.start();

    const filter = au.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = pitch * 4;
    filter.Q.value = 5;

    const gain = au.createGain();
    gain.gain.value = 0.0;

    const panner = au.createPanner();
    panner.panningModel = "equalpower";
    panner.setPosition(pan, 0, 1 - Math.abs(pan));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(destination);

    gain.gain.linearRampToValueAtTime(0.1, au.currentTime + attack);

    await time(sustain + attack);
    gain.gain.setValueAtTime(0.1, au.currentTime);
    gain.gain.linearRampToValueAtTime(0, au.currentTime + release);
    filter.frequency.linearRampToValueAtTime(
      Math.max(pitch / 2, 400),
      au.currentTime + release
    );

    await time(release + 0.01);
    osc.stop(au.currentTime);
    panner.disconnect();
  }

  function SimpleToneSynth(
    attack: number,
    sustain: number,
    release: number,
    destination: AudioNode = master.in
  ) {
    function play(note: FullNote) {
      tone(pitch(note), attack, sustain, release, biRnd(), destination);
    }
    return {
      play,
    };
  }

  function DelayInsert(
    time: number,
    feedback: number,
    wet: number,
    destination: AudioNode = master.in
  ) {
    const delayNode = au.createDelay(1);
    delayNode.delayTime.value = time;
    const feedbackGain = au.createGain();
    feedbackGain.gain.value = feedback;
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    const delayGain = au.createGain();
    delayGain.gain.value = wet;
    delayNode.connect(delayGain);
    delayGain.connect(destination);
    const synthOut = au.createGain();
    synthOut.gain.value = 1.0;
    synthOut.connect(delayNode);
    synthOut.connect(destination);
    return {
      in: synthOut,
      feedback: feedbackGain.gain,
      wet: delayGain.gain,
      delayTime: delayNode.delayTime,
    };
  }

  function ThreeOh(
    type: OscillatorType = "sawtooth",
    out: AudioNode = master.in
  ) {
    const filter = au.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 20;
    filter.frequency.value = 300;
    const pResonance = filter.Q;
    const pCutoff = filter.frequency;

    const decayTimeNode = constantSourceCompatible();
    decayTimeNode.start();
    const pDecay = decayTimeNode.offset;

    const env = constantSourceCompatible();
    env.start();
    env.offset.value = 0.0;

    function trigger() {}

    const scaleNode = au.createGain();
    scaleNode.gain.value = 4000;
    const pEnvMod = scaleNode.gain;
    env.connect(scaleNode);
    scaleNode.connect(filter.detune);

    const osc = au.createOscillator();
    osc.type = type;

    osc.frequency.value = 440;
    osc.start();

    const vca = au.createGain();
    vca.gain.value = 0.0;

    osc.connect(vca);
    vca.connect(filter);
    filter.connect(out);

    function noteOn(
      note: FullNote,
      accent: boolean = false,
      glide: boolean = false
    ) {
      if (accent) {
        env.offset.cancelScheduledValues(au.currentTime);
        //env.offset.setTargetAtTime(1.0,au.currentTime, 0.001);
        env.offset.setValueAtTime(1.0, au.currentTime);
        env.offset.exponentialRampToValueAtTime(
          0.01,
          au.currentTime + pDecay.value / 3
        );
      } else {
        env.offset.cancelScheduledValues(au.currentTime);
        //env.offset.setTargetAtTime(1.0,au.currentTime, 0.001);
        env.offset.setValueAtTime(1.0, au.currentTime);
        env.offset.exponentialRampToValueAtTime(
          0.01,
          au.currentTime + pDecay.value
        );
      }
      osc.frequency.cancelScheduledValues(au.currentTime);
      osc.frequency.setTargetAtTime(
        midiNoteToFrequency(textNoteToNumber(note)),
        au.currentTime,
        glide ? 0.02 : 0.002
      );
      vca.gain.cancelScheduledValues(au.currentTime);
      vca.gain.setValueAtTime(accent ? 0.2 : 0.15, au.currentTime);
      //vca.gain.setTargetAtTime(accent ? 0.5 : 0.3,au.currentTime, 0.001);
      //vca.gain.setValueAtTime(0.2, au.currentTime);
      vca.gain.linearRampToValueAtTime(0.1, au.currentTime + 0.2);
      trigger();
    }

    function noteOff() {
      vca.gain.cancelScheduledValues(au.currentTime);
      vca.gain.setTargetAtTime(0.0, au.currentTime, 0.01);
    }

    return {
      noteOn,
      noteOff,
      params: {
        cutoff: pCutoff,
        resonance: pResonance,
        envMod: pEnvMod,
        decay: pDecay,
      },
    };
  }

  function kick(out: AudioNode = master.in) {
    const osc = au.createOscillator();
    osc.frequency.value = 400;
    const gain = au.createGain();
    gain.gain.value = 0.3;
    osc.start();
    osc.frequency.exponentialRampToValueAtTime(50, au.currentTime + 0.04);
    gain.gain.setValueCurveAtTime(
      [0.5, 0.5, 0.45, 0.4, 0.25, 0.0],
      au.currentTime,
      0.09
    );

    osc.stop(au.currentTime + 0.1);
    window.setTimeout(() => gain.disconnect(), 200);

    osc.connect(gain);
    gain.connect(out);
  }

  async function loadBuffer(filePath: string) {
    const response = await fetch(filePath);
    const arraybuffer = await response.arrayBuffer();

    const audioBuffer = await decodeAudioDataCompatible(arraybuffer);
    return audioBuffer;
  }

  async function Sampler(file: string) {
    const sampleBuffer = await loadBuffer(file);
    function play(
      gain: number = 0.4,
      decay: number = 1.0,
      out: AudioNode = master.in
    ) {
      const bufferSource = au.createBufferSource();
      bufferSource.buffer = sampleBuffer;
      bufferSource.loop = false;

      const gainNode = au.createGain();
      gainNode.gain.setValueAtTime(gain, au.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.0, au.currentTime + decay);

      bufferSource.connect(gainNode);
      gainNode.connect(out);
      bufferSource.start(au.currentTime);
    }
    return {
      play,
    };
  }

  async function SamplerDrumMachine(
    files: string[],
    out: AudioNode = master.in
  ) {
    const sum = au.createGain();
    sum.gain.value = 1.0;
    sum.connect(out);

    const promisedMachines = files.map(Sampler);
    const samplers = await Promise.all(promisedMachines);
    const mapped = samplers.map((sampler) => ({
      play: (vel: number) => sampler.play(0.7 * vel, vel * 0.5, sum),
    }));

    return {
      triggers: mapped,
    };
  }

  return {
    tone,
    SimpleToneSynth,
    DelayInsert,
    ThreeOh,
    kick,
    Sampler,
    SamplerDrumMachine,
    master,
    context: au,
  };
}

export type AudioT = ReturnType<typeof Audio>;
