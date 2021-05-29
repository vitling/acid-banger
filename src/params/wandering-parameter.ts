import { NumericParameter } from "../../typings/interface";

export function WanderingParameter(
  param: NumericParameter,
  scaleFactor = 1 / 400
) {
  const [min, max] = param.bounds;

  let diff = 0.0;
  let scale = scaleFactor * (max - min);
  let touchCountdown = 0;

  let previousValue = (min + max) / 2;

  const step = () => {
    if (previousValue != param.value) {
      // Something else has touched this parameter
      diff = 0;
      previousValue = param.value;
      touchCountdown = 200;
    } else {
      if (touchCountdown > 0) {
        touchCountdown--;
      }

      if (touchCountdown < 100) {
        diff *= touchCountdown > 0 ? 0.8 : 0.98;
        diff += (Math.random() - 0.5) * scale;
        param.value += diff;

        previousValue = param.value;
        if (param.value > min + 0.8 * (max - min)) {
          diff -= Math.random() * scale;
        } else if (param.value < min + 0.2 * (max - min)) {
          diff += Math.random() * scale;
        }
      }
    }
  };

  return {
    step,
  };
}
