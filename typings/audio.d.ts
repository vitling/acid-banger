export type Note = "A" | "A#" | "B" | "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#";

export type Octave = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export type FullNote = `${Note}${Octave}`;

export type AudioT = {
  tone: (
    pitch: number,
    attack: number,
    sustain: number,
    release: number,
    pan?: number,
    destination?: AudioNode
  ) => Promise<void>;
  SimpleToneSynth: (
    attack: number,
    sustain: number,
    release: number,
    destination?: AudioNode
  ) => {
    play: (note: FullNote) => void;
  };
  DelayInsert: (
    time: number,
    feedback: number,
    wet: number,
    destination?: AudioNode
  ) => {
    in: GainNode;
    feedback: AudioParam;
    wet: AudioParam;
    delayTime: AudioParam;
  };
  ThreeOh: (
    type?: OscillatorType,
    out?: AudioNode
  ) => {
    noteOn: (note: FullNote, accent?: boolean, glide?: boolean) => void;
    noteOff: () => void;
    params: {
      cutoff: AudioParam;
      resonance: AudioParam;
      envMod: AudioParam;
      decay: AudioParam;
    };
  };
  kick: (out?: AudioNode) => void;
  Sampler: (file: string) => Promise<{
    play: (gain?: number, decay?: number, out?: AudioNode) => void;
  }>;
  SamplerDrumMachine: (
    files: string[],
    out?: AudioNode
  ) => Promise<{
    triggers: {
      play: (vel: number) => void;
    }[];
  }>;
  master: {
    in: GainNode;
    analyser: AnalyserNode;
  };
  context: AudioContext;
};
