/*
  Copyright 2021 David Whiting
  This work is licensed under a Creative Commons Attribution 4.0 International License
  https://creativecommons.org/licenses/by/4.0/
*/

export function rndInt(maxExcl: number): number {
  return Math.floor(Math.random() * (maxExcl - 0.01));
}

export function biRnd(): number {
  return Math.random() * 2 - 1;
}

export function choose<T>(array: T[]): T {
  return array[rndInt(array.length)];
}
