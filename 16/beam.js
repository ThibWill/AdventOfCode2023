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

const parser = (doc) => {
  return doc.split('\n');
}

const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  RIGHT: "RIGHT",
  LEFT: "LEFT"
};

const beamHandler = (() => {
  const startBeam = {
    start: {
      row: 0,
      column: 0
    },
    direction: DIRECTION.RIGHT
  };

  const records = [startBeam];
  const stack = [startBeam];

  const addBeam = (beam) => {
    const existingBeam = records.find((record) => record.start.row === beam.start.row && record.start.column === beam.start.column && record.direction === beam.direction);
    if (existingBeam) {
      return;
    }

    stack.push(beam);
    records.push(beam);
  }

  const getNextBeam = () => stack.pop();

  return {
    addBeam,
    getNextBeam
  }
})();

const mirrorLeft = {
  symbol: '\\',
  reflect: (mirrorPosition, beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.UP],
      "RIGHT": [DIRECTION.DOWN],
      "DOWN": [DIRECTION.RIGHT],
      "UP": [DIRECTION.LEFT]
    }

    for (const redirection of redirections[beamFrom]) {
      beamHandler.addBeam({
        start: mirrorPosition,
        direction: redirection
      });
    }
  }
}

const mirrorRight = {
  symbol: '/',
  reflect: (mirrorPosition, beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.DOWN],
      "RIGHT": [DIRECTION.UP],
      "DOWN": [DIRECTION.LEFT],
      "UP": [DIRECTION.RIGHT]
    }

    for (const redirection of redirections[beamFrom]) {
      beamHandler.addBeam({
        start: mirrorPosition,
        direction: redirection
      });
    }
  }
}

const splitterHorizontal = {
  symbol: '-',
  reflect: (mirrorPosition, beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.LEFT],
      "RIGHT": [DIRECTION.RIGHT],
      "DOWN": [DIRECTION.LEFT, DIRECTION.RIGHT],
      "UP": [DIRECTION.LEFT, DIRECTION.RIGHT],
    }

    for (const redirection of redirections[beamFrom]) {
      beamHandler.addBeam({
        start: mirrorPosition,
        direction: redirection
      });
    }
  }
}

const splitterVertical = {
  symbol: '|',
  reflect: (mirrorPosition, beamFrom) => {

    const redirections = {
      "LEFT": [DIRECTION.DOWN, DIRECTION.UP],
      "RIGHT": [DIRECTION.DOWN, DIRECTION.UP],
      "DOWN": [DIRECTION.DOWN],
      "UP": [DIRECTION.UP],
    }

    for (const redirection of redirections[beamFrom]) {
      beamHandler.addBeam({
        start: mirrorPosition,
        direction: redirection
      });
    }
  }
}

const extractMirror = (space) => {
  const mirrorTypes = [mirrorLeft, mirrorRight, splitterHorizontal, splitterVertical];
  for (const mirrorType of mirrorTypes) {
    if (mirrorType.symbol === space) {
      return mirrorType;
    }
  }

  return null;
}

const extractMirrors = (layout) => {
  const mirrors = [];
  for (let rowNum = 0; rowNum < layout.length; rowNum++) {
    const row = layout[rowNum];
    for (let columnNum = 0; columnNum < row.length; columnNum++) {
      const mirror = extractMirror(row[columnNum]);

      if (mirror === null) {
        continue;
      }

      mirrors.push({
        position: {
          row: rowNum, 
          column: columnNum
        },
        type: mirror
      })
    }
  }
  return mirrors;
}

const findNextMirror = (mirrors, beam) => {

  const directionRules = {
    "RIGHT": {
      isNotInTheWay: (mirror, beam) => mirror.position.row !== beam.start.row,
      isTheClosest: (mirror, beam, currentClosestMirror) => (mirror.position.column > beam.start.column) && (!currentClosestMirror || currentClosestMirror.position.column > mirror.position.column),
      border: (layoutLimits, beam) => ({ row: beam.start.row, column: layoutLimits.column })
    },
    "LEFT": {
      isNotInTheWay: (mirror, beam) => mirror.position.row !== beam.start.row,
      isTheClosest: (mirror, beam, currentClosestMirror) => (mirror.position.column < beam.start.column) && (!currentClosestMirror || currentClosestMirror.position.column < mirror.position.column),
      border: (_layoutLimits, beam) => ({ row: beam.start.row, column: 0 })
    },
    "DOWN": {
      isNotInTheWay: (mirror, beam) => mirror.position.column !== beam.start.column,
      isTheClosest: (mirror, beam, currentClosestMirror) => (mirror.position.row > beam.start.row) && (!currentClosestMirror || currentClosestMirror.position.row > mirror.position.row),
      border: (layoutLimits, beam) => ({ row: layoutLimits.row, column: beam.start.column })
    },
    "UP": {
      isNotInTheWay: (mirror, beam) => mirror.position.column !== beam.start.column,
      isTheClosest: (mirror, beam, currentClosestMirror) => (mirror.position.row < beam.start.row) && (!currentClosestMirror || currentClosestMirror.position.row < mirror.position.row),
      border: (_layoutLimits, beam) => ({ row: 0, column: beam.start.column })
    },
  }

  let currentClosestMirror = null;
  const beamDirectionRules = directionRules[beam.direction];
  for (const mirror of mirrors) {
    if (beamDirectionRules.isNotInTheWay(mirror, beam)) {
      continue;
    }

    if (beamDirectionRules.isTheClosest(mirror, beam, currentClosestMirror)) {
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

const start = (mirrors, beamHandler, layoutLimits) => {
  let compt = 0;
  let beam = beamHandler.getNextBeam();
  while(beam) {
    const nextMirror = findNextMirror(mirrors, beam);
    setLightenedSpaces(layoutLimits, beam, nextMirror);

    if (nextMirror) {
      nextMirror.type.reflect(nextMirror.position, beam.direction);
    }
    compt ++;
    beam = beamHandler.getNextBeam();
  }
}

const layout = parser(test);
const mirrors = extractMirrors(layout);

start(mirrors, beamHandler, {
  row: layout[0].length - 1,
  column: layout.length - 1
});

console.log(lights.size)