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
const test = `.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`;
const test2 = `......|...\\..\\...
..../........|...
....\\.-.../......
......|....../...
.................`;
const parser = (doc) => {
    return doc.split('\n');
};
class BeamStack {
    records;
    stack;
    constructor(beams) {
        this.records = [...beams];
        this.stack = [...beams];
    }
    push(beams) {
        for (const beam of beams) {
            const existingBeam = this.records.find((recordBeam) => recordBeam.isSame(beam));
            if (existingBeam) {
                return;
            }
            this.stack.push(beam);
            this.records.push(beam);
        }
    }
    pop() {
        return this.stack.pop();
    }
}
class Beam {
    origin;
    direction;
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
    isSame(beam) {
        return beam.origin.row === this.origin.row && beam.origin.column === this.origin.column && beam.direction === this.direction;
    }
    getOrigin() {
        return this.origin;
    }
    getDirection() {
        return this.direction;
    }
    getPositionRow() {
        return this.origin.row;
    }
    getPositionColumn() {
        return this.origin.column;
    }
}
class Mirror {
    position;
    symbol;
    redirects;
    constructor(symbol, position, redirects) {
        this.symbol = symbol;
        this.position = position;
        this.redirects = redirects;
    }
    reflect(originDirection) {
        return this.redirects[originDirection].map(redirect => new Beam(this.position, redirect));
    }
    getSymbol() {
        return this.symbol;
    }
    getPosition() {
        return this.position;
    }
    getPositionRow() {
        return this.position.row;
    }
    getPositionColumn() {
        return this.position.column;
    }
}
class MirrorLeft extends Mirror {
    constructor(position) {
        const redirects = {
            "LEFT": ["UP"],
            "RIGHT": ["DOWN"],
            "DOWN": ["RIGHT"],
            "UP": ["LEFT"]
        };
        super("\\", position, redirects);
    }
}
class MirrorRight extends Mirror {
    constructor(position) {
        const redirects = {
            "LEFT": ["DOWN"],
            "RIGHT": ["UP"],
            "DOWN": ["LEFT"],
            "UP": ["RIGHT"]
        };
        super("/", position, redirects);
    }
}
class MirrorHorizontal extends Mirror {
    constructor(position) {
        const redirects = {
            "LEFT": ["LEFT"],
            "RIGHT": ["RIGHT"],
            "DOWN": ["LEFT", "RIGHT"],
            "UP": ["LEFT", "RIGHT"]
        };
        super("-", position, redirects);
    }
}
class MirrorVertical extends Mirror {
    constructor(position) {
        const redirects = {
            "LEFT": ["DOWN", "UP"],
            "RIGHT": ["DOWN", "UP"],
            "DOWN": ["DOWN"],
            "UP": ["UP"]
        };
        super("|", position, redirects);
    }
}
const mirrorFactory = (symbol, position) => {
    const mirrorTypes = {
        '\\': MirrorLeft,
        '/': MirrorRight,
        '-': MirrorHorizontal,
        '|': MirrorVertical
    };
    const mirrorType = mirrorTypes[symbol];
    if (mirrorType) {
        return new mirrorType(position);
    }
    return null;
};
const findMirrors = (layout) => {
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
};
const findNextMirror = (mirrors, beam) => {
    const directionRules = {
        "RIGHT": (mirror, beam, currentClosestMirror) => (mirror.getPositionRow() === beam.getPositionRow()) && (mirror.getPositionColumn() > beam.getPositionColumn()) && (!currentClosestMirror || currentClosestMirror.getPositionColumn() > mirror.getPositionColumn()),
        "LEFT": (mirror, beam, currentClosestMirror) => (mirror.getPositionRow() === beam.getPositionRow()) && (mirror.getPositionColumn() < beam.getPositionColumn()) && (!currentClosestMirror || currentClosestMirror.getPositionColumn() < mirror.getPositionColumn()),
        "DOWN": (mirror, beam, currentClosestMirror) => (mirror.getPositionColumn() === beam.getPositionColumn()) && (mirror.getPositionRow() > beam.getPositionRow()) && (!currentClosestMirror || currentClosestMirror.getPositionRow() > mirror.getPositionRow()),
        "UP": (mirror, beam, currentClosestMirror) => (mirror.getPositionColumn() === beam.getPositionColumn()) && (mirror.getPositionRow() < beam.getPositionRow()) && (!currentClosestMirror || currentClosestMirror.getPositionRow() < mirror.getPositionRow()),
    };
    let currentClosestMirror = null;
    const directionRule = directionRules[beam.getDirection()];
    for (const mirror of mirrors) {
        if (directionRule(mirror, beam, currentClosestMirror)) {
            currentClosestMirror = mirror;
        }
    }
    return currentClosestMirror;
};
class LightningTilesCounter {
    lights;
    constructor() {
        this.lights = new Set();
    }
    setLightenedTiles(layoutLimits, beam, nextMirror) {
        const borderDirectionRules = {
            "RIGHT": (layoutLimits, start) => ({ row: start.row, column: layoutLimits.column }),
            "LEFT": (_layoutLimits, start) => ({ row: start.row, column: 0 }),
            "DOWN": (layoutLimits, start) => ({ row: layoutLimits.row, column: start.column }),
            "UP": (_layoutLimits, start) => ({ row: 0, column: start.column })
        };
        const origin = beam.getOrigin();
        let end;
        if (!nextMirror) {
            end = borderDirectionRules[beam.getDirection()](layoutLimits, origin);
        }
        else {
            end = nextMirror.getPosition();
        }
        // TODO to refactor
        if (origin.row === end.row) {
            const lowest = origin.column < end.column ? origin.column : end.column;
            const highest = origin.column < end.column ? end.column : origin.column;
            for (let i = lowest; i <= highest; i++) {
                this.lights.add(`${origin.row}, ${i}`);
            }
        }
        else {
            const lowest = origin.row < end.row ? origin.row : end.row;
            const highest = origin.row < end.row ? end.row : origin.row;
            for (let i = lowest; i <= highest; i++) {
                this.lights.add(`${i}, ${origin.column}`);
            }
        }
    }
    getNbLightenedTiles() {
        return this.lights.size;
    }
}
const generateStartingBeams = (layoutLimits) => {
    const upBeams = Array.from(new Array(layoutLimits.column + 1), (_e, i) => new Beam({ row: -1, column: i }, "DOWN"));
    const downBeams = Array.from(new Array(layoutLimits.column + 1), (_e, i) => new Beam({ row: layoutLimits.row + 1, column: i }, "UP"));
    const leftBeams = Array.from(new Array(layoutLimits.row + 1), (_e, i) => new Beam({ row: i, column: -1 }, "RIGHT"));
    const rightBeams = Array.from(new Array(layoutLimits.row + 1), (_e, i) => new Beam({ row: i, column: layoutLimits.column + 1 }, "LEFT"));
    return [...upBeams, ...downBeams, ...leftBeams, ...rightBeams];
};
const start = (mirrors, beamStack, layoutLimits, lightningTilesCounter) => {
    let beam = beamStack.pop();
    while (beam) {
        const nextMirror = findNextMirror(mirrors, beam);
        lightningTilesCounter.setLightenedTiles(layoutLimits, beam, nextMirror);
        if (nextMirror) {
            const beamsGeneratedWithReflection = nextMirror.reflect(beam.getDirection());
            beamStack.push(beamsGeneratedWithReflection);
        }
        beam = beamStack.pop();
    }
    return lightningTilesCounter.getNbLightenedTiles();
};
const doc = await loadDocument();
const layout = parser(doc);
const mirrors = findMirrors(layout);
const layoutLimit = {
    row: layout.length - 1,
    column: layout[0].length - 1
};
const startingBeams = generateStartingBeams(layoutLimit);
const tries = [];
for (const startBeam of startingBeams) {
    const beamStackInstance = new BeamStack([startBeam]);
    const lightningTilesCounter = new LightningTilesCounter();
    const nbLightenedTiles = start(mirrors, beamStackInstance, layoutLimit, lightningTilesCounter);
    tries.push(nbLightenedTiles - 1);
}
console.log(Math.max(...tries));
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
