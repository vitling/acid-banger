import { choose } from "../math";

export function NineOhGen(): {
  createPatterns: (full?: boolean) => number[][];
} {
  function createPatterns(full = false) {
    const kickPattern: number[] = new Array(16);
    const ohPattern: number[] = new Array(16);
    const chPattern: number[] = new Array(16);
    const sdPattern: number[] = new Array(16);
    const kickMode: string = choose(["electro", "fourfloor"]);
    const hatMode: string = choose(["offbeats", "closed", full ? "offbeats" : "none"]);
    const snareMode: string = choose(["backbeat", "skip", full ? "backbeat" : "none"]);

    if (kickMode == "fourfloor") {
      for (let i = 0; i < 16; i++) {
        if (i % 4 == 0) {
          kickPattern[i] = 0.9;
        } else if (i % 2 == 0 && Math.random() < 0.1) {
          kickPattern[i] = 0.6;
        }
      }
    } else if (kickMode == "electro") {
      for (let i = 0; i < 16; i++) {
        if (i == 0) {
          kickPattern[i] = 1;
        } else if (i % 2 == 0 && i % 8 != 4 && Math.random() < 0.5) {
          kickPattern[i] = Math.random() * 0.9;
        } else if (Math.random() < 0.05) {
          kickPattern[i] = Math.random() * 0.9;
        }
      }
    }

    if (snareMode == "backbeat") {
      for (let i = 0; i < 16; i++) {
        if (i % 8 === 4) {
          sdPattern[i] = 1;
        }
      }
    } else if (snareMode == "skip") {
      for (let i = 0; i < 16; i++) {
        if (i % 8 === 3 || i % 8 === 6) {
          sdPattern[i] = 0.6 + Math.random() * 0.4;
        } else if (i % 2 === 0 && Math.random() < 0.2) {
          sdPattern[i] = 0.4 + Math.random() * 0.2;
        } else if (Math.random() < 0.1) {
          sdPattern[i] = 0.2 + Math.random() * 0.2;
        }
      }
    }

    if (hatMode == "offbeats") {
      for (let i = 0; i < 16; i++) {
        if (i % 4 == 2) {
          ohPattern[i] = 0.4;
        } else if (Math.random() < 0.3) {
          if (Math.random() < 0.5) {
            chPattern[i] = Math.random() * 0.2;
          } else {
            ohPattern[i] = Math.random() * 0.2;
          }
        }
      }
    } else if (hatMode == "closed") {
      for (let i = 0; i < 16; i++) {
        if (i % 2 === 0) {
          chPattern[i] = 0.4;
        } else if (Math.random() < 0.5) {
          chPattern[i] = Math.random() * 0.3;
        }
      }
    }
    return [kickPattern, ohPattern, chPattern, sdPattern];
  }
  return {
    createPatterns,
  };
}
