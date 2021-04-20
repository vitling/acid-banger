#!/usr/bin/env bash

mkdir -p dist
tsc -p .
webpack ./js/app.js -o dist/ --mode production
cp index.html *.wav ui.css preview.png dist
