const test = 
  `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
  Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
  Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
  Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
  Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`;

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./games.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const parser = (doc) => doc.split('\n');

const findRGBRound = (round) => {
  const regexs = [/(\d+) red/, /(\d+) green/, /(\d+) blue/];
  let numbers = [];
  for (const regex of regexs) {
    const extract = round.match(regex);
    numbers.push(parseInt(extract?.[1]) || 0);
  }
  return numbers;
}

const findGameNumber = (line) => {
  const extract = line.match(/Game (\d+):/);
  return parseInt(extract?.[1]) ?? 0;
}

const findMaxRGBGame = (line) => {
  const maxRGB = [0, 0, 0];
  const rounds = line.split(';');
  for (const round of rounds) {
    const RGBround = findRGBRound(round);

    for (let i = 0; i < maxRGB.length; i++) {
      if (RGBround[i] > maxRGB[i]) {
        maxRGB[i] = RGBround[i];
      }
    }
  }

  return maxRGB;
}

const findValueGame = (line) => {
  // const maxRGB = [12, 13, 14];
  const maxRGBGame = findMaxRGBGame(line);
  /*for (let i = 0; i < maxRGB.length; i++) {
    if (maxRGBGame[i] > maxRGB[i]) {
      return 0;
    }
  }*/

  return maxRGBGame.reduce((acc, curr) => curr * acc, 1)
}

const calibrationDocument = await loadDocument()
const games = parser(calibrationDocument)
console.log(games.reduce((acc, curr) => acc + findValueGame(curr), 0))
