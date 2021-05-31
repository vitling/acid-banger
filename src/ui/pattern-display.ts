import { PatternParameter, NumericParameter } from "@typings/interface";
import { textNoteToNumber } from "../audio";
import { ColorScheme, defaultColors } from "./palette";

export function PatternDisplay(
  patternParam: PatternParameter,
  stepParam: NumericParameter,
  colors: ColorScheme = defaultColors
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.classList.add("pattern");
  function repaint() {
    const pattern = patternParam.value;
    const w = (canvas.width = canvas.clientWidth);
    const h = (canvas.height = 200);
    const vScale = h / 50;
    const g = canvas.getContext("2d") as CanvasRenderingContext2D;

    g.font = "10px Orbitron";

    g.fillStyle = colors.bg;
    g.fillRect(0, 0, w, h);

    g.strokeStyle = colors.grid;
    for (let i = 0; i < pattern.length; i++) {
      const x = (w * i) / pattern.length;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let i = 0; i < 80; i++) {
      const y = h - i * vScale;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }

    for (let i = 0; i < pattern.length; i++) {
      const s = pattern[i];
      if (s.note === "-") {
        // Do nothing
      } else {
        const n = textNoteToNumber(s.note) - 24;
        const x = (w * i) / pattern.length;
        const y = h - n * vScale;
        const bw = w / pattern.length;
        const bh = 5;

        g.fillStyle = s.glide ? colors.glide : s.accent ? colors.accent : colors.note;
        g.fillRect(x, y, bw, bh);

        g.fillStyle = colors.text;
        const xt = x + bw / 2 - g.measureText(s.note).width / 2;
        g.fillText(s.note, xt, y);
      }
    }

    g.fillStyle = colors.highlight;
    g.fillRect((w * stepParam.value) / pattern.length, 0, w / pattern.length, h);
  }

  patternParam.subscribe(repaint);
  stepParam.subscribe(repaint);

  return canvas;
}
