import { GeneralisedParameter, DrumPattern, NumericParameter } from "@typings/interface";
import { ColorScheme, defaultColors } from "./palette";

export function DrumDisplay(
  pattern: GeneralisedParameter<DrumPattern>,
  mutes: GeneralisedParameter<boolean>[],
  stepParam: NumericParameter,
  colors: ColorScheme = defaultColors
) {
  const canvas = document.createElement("canvas");
  canvas.classList.add("pattern");

  function repaint() {
    const w = (canvas.width = canvas.clientWidth);
    const h = (canvas.height = 100);
    const g = canvas.getContext("2d") as CanvasRenderingContext2D;
    g.fillStyle = colors.bg;
    g.fillRect(0, 0, w, h);

    for (let i = 0; i < 16; i++) {
      const x = (w * i) / 16;
      for (let p = 0; p < pattern.value.length; p++) {
        const y = (p / pattern.value.length) * h;
        if (pattern.value[p][i]) {
          if (mutes[p].value) {
            g.fillStyle = "rgba(128,0,0,0.4)";
          } else {
            g.fillStyle = "rgba(136,170,204," + pattern.value[p][i] + ")";
          }
          g.fillRect(x, y, w / 16, h / pattern.value.length);
        }
      }
    }

    g.fillStyle = colors.highlight;
    g.fillRect((w * stepParam.value) / 16, 0, w / 16, h);
  }

  pattern.subscribe(repaint);
  stepParam.subscribe(repaint);

  return canvas;
}
