export const defaultColors = {
  bg: "#222266",
  note: "#88aacc",
  accent: "#AA88CC",
  glide: "#CCAA88",
  text: "#CCCCFF",
  highlight: "rgba(255,255,255,0.2)",
  grid: "rgba(255,255,255,0.2)",
  dial: "#AA88CC",
};

export type ColorScheme = { [color in keyof typeof defaultColors]: string };
