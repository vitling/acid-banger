export function AudioMeter(analyser: AnalyserNode): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  const w = (canvas.width = 200);
  const h = (canvas.height = 100);
  const g = canvas.getContext("2d") as CanvasRenderingContext2D;

  const output = new Uint8Array(analyser.fftSize);

  function draw() {
    //w = canvas.width = canvas.clientWidth;
    analyser.getByteTimeDomainData(output);

    g.clearRect(0, 0, w, h);
    g.strokeStyle = "white";
    g.beginPath();
    g.moveTo(0, h / 2);
    for (let i = 0; i < output.length; i++) {
      const v = output[i] / 128 - 1;
      g.lineTo((w * i) / output.length, h / 2 + (1.5 * v * h) / 2);
    }

    g.stroke();
    window.requestAnimationFrame(draw);
  }
  window.requestAnimationFrame(draw);

  return canvas;
}
