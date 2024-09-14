import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./layout.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`;

const test2 = 
`......|...\\..\\...
..../........|...
....\\.-.../......
......|....../...
.................`;

const parser = (doc) => {
  return doc.split('\n');
}

const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  RIGHT: "RIGHT",
  LEFT: "LEFT"
};

const beamStack = (() => {
  const startBeam = {
    start: {
      row: 0,
      column: 0
    },
    direction: DIRECTION.RIGHT
  };

  const records = [startBeam];
  const stack = [startBeam];

  const push = (beam) => {
    const existingBeam = records.find((record) => record.start.row === beam.start.row && record.start.column === beam.start.column && record.direction === beam.direction);
    if (existingBeam) {
      return;
    }

    stack.push(beam);
    records.push(beam);
  }

  const pop = () => stack.pop();

  return {
    push,
    pop
  }
})();

const mirrorLeft = (position) => ({
  symbol: '\\',
  position,
  reflect: (beamFrom) => {
    const redirections = {
      "LEFT": [DIRECTION.UP],
      "RIGHT": [DIRECTION.DOWN],
      "DOWN": [DIRECTION.RIGHT],
      "UP": [DIRECTION.LEFT]
    }

    for (const redirection of redirections[beamFrom]) {
      beamStack.push({
        start: position,
        direction: redirection
      });
    }
  }
});

const mirrorRight = (position) => ({
  symbol: '/',
  position,
  reflect: (beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.DOWN],
      "RIGHT": [DIRECTION.UP],
      "DOWN": [DIRECTION.LEFT],
      "UP": [DIRECTION.RIGHT]
    }

    for (const redirection of redirections[beamFrom]) {
      beamStack.push({
        start: position,
        direction: redirection
      });
    }
  }
});

const splitterHorizontal = (position) => ({
  symbol: '-',
  position,
  reflect: (beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.LEFT],
      "RIGHT": [DIRECTION.RIGHT],
      "DOWN": [DIRECTION.LEFT, DIRECTION.RIGHT],
      "UP": [DIRECTION.LEFT, DIRECTION.RIGHT],
    }

    for (const redirection of redirections[beamFrom]) {
      beamStack.push({
        start: position,
        direction: redirection
      });
    }
  }
});

const splitterVertical = (position) => ({
  symbol: '|',
  position,
  reflect: (beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.DOWN, DIRECTION.UP],
      "RIGHT": [DIRECTION.DOWN, DIRECTION.UP],
      "DOWN": [DIRECTION.DOWN],
      "UP": [DIRECTION.UP],
    }

    for (const redirection of redirections[beamFrom]) {
      beamStack.push({
        start: position,
        direction: redirection
      });
    }
  }
});

const mirrorFactory = (space, position) => {
  const mirrorTypes = {
    '\\': mirrorLeft, 
    '/': mirrorRight, 
    '-': splitterHorizontal, 
    '|': splitterVertical
  };

  const mirrorType = mirrorTypes[space];
  if (mirrorType) {
    return mirrorType(position)
  }

  return null;
}

const extractMirrors = (layout) => {
  const mirrors = [];
  for (let rowNum = 0; rowNum < layout.length; rowNum++) {
    const row = layout[rowNum];
    for (let columnNum = 0; columnNum < row.length; columnNum++) {
      const mirror = mirrorFactory(row[columnNum], {
        row: rowNum, 
        column: columnNum
      });

      if (mirror === null) {
        continue;
      }

      mirrors.push(mirror);
    }
  }
  return mirrors;
}

const findNextMirror = (mirrors, beam) => {

  if (beam.start.row === 0 && beam.start.column === 0 && beam.direction === 'RIGHT') {
    const isMirrorStart = mirrors.find(m => m.position.row === 0 && m.position.column === 0);
    if (isMirrorStart) {
      return isMirrorStart;
    }
  }

  const directionRules = {
    "RIGHT": (mirror, beam, currentClosestMirror) => (mirror.position.row === beam.start.row) && (mirror.position.column > beam.start.column) && (!currentClosestMirror || currentClosestMirror.position.column > mirror.position.column),
    "LEFT": (mirror, beam, currentClosestMirror) => (mirror.position.row === beam.start.row) && (mirror.position.column < beam.start.column) && (!currentClosestMirror || currentClosestMirror.position.column < mirror.position.column),
    "DOWN": (mirror, beam, currentClosestMirror) => (mirror.position.column === beam.start.column) && (mirror.position.row > beam.start.row) && (!currentClosestMirror || currentClosestMirror.position.row > mirror.position.row),
    "UP": (mirror, beam, currentClosestMirror) => (mirror.position.column === beam.start.column) && (mirror.position.row < beam.start.row) && (!currentClosestMirror || currentClosestMirror.position.row < mirror.position.row),
  }

  let currentClosestMirror = null;
  const directionRule = directionRules[beam.direction];
  for (const mirror of mirrors) {
    if (directionRule(mirror, beam, currentClosestMirror)) {
      currentClosestMirror = mirror;
    }
  }

  return currentClosestMirror;
}

const lights = new Set();
const setLightenedSpaces = (layoutLimits, beam, nextMirror) => {
  const directionRules = {
    "RIGHT": {
      border: (layoutLimits, start) => ({ row: start.row, column: layoutLimits.column })
    },
    "LEFT": {
      border: (_layoutLimits, start) => ({ row: start.row, column: 0 })
    },
    "DOWN": {
      border: (layoutLimits, start) => ({ row: layoutLimits.row, column: start.column })
    },
    "UP": {
      border: (_layoutLimits, start) => ({ row: 0, column: start.column })
    }
  }

  const start = beam.start;
  let end;
  if (!nextMirror) {
    end = directionRules[beam.direction].border(layoutLimits, start);
  } else {
    end = nextMirror.position;
  }
  
  // TODO to refactor
  if (start.row === end.row) {
    const lowest = start.column < end.column ? start.column : end.column;
    const highest = start.column < end.column ? end.column : start.column;

    for (let i = lowest; i <= highest; i++) {
      lights.add(`${start.row}, ${i}`);
    }
  } else {
    const lowest = start.row < end.row ? start.row : end.row;
    const highest = start.row < end.row ? end.row : start.row;

    for (let i = lowest; i <= highest; i++) {
      lights.add(`${i}, ${start.column}`);
    }
  }
}

const start = (mirrors, beamStack, layoutLimits) => {
  let compt = 0;
  let beam = beamStack.pop();
  while (beam) {
    const nextMirror = findNextMirror(mirrors, beam);
    setLightenedSpaces(layoutLimits, beam, nextMirror);

    if (nextMirror) {
      nextMirror.reflect(beam.direction);
    }
    compt ++;
    beam = beamStack.pop();
  }
}

const doc = await loadDocument();
const layout = parser(doc);
const mirrors = extractMirrors(layout);

start(mirrors, beamStack, {
  row: layout.length - 1,
  column: layout[0].length - 1
});
console.log(lights.size);

/*const arrLights = Array.from(lights);
let room = '';
for (let row = 0; row < layout.length; row++) {
  for (let column = 0; column < layout[0].length; column++) {
    if (arrLights.find(e => e === `${row}, ${column}`)) {
      room += '#';
    } else {
      room += '.';
    }
  }
  room += '\n';
}
console.log(room);*/