/*import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./layout.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}*/

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

type Direction = "UP" | "DOWN" | "RIGHT" | "LEFT";
type Position = { row: number, column: number };

class BeamStack {
  private records: Beam[];
  private stack: Beam[];

  constructor (beams: Beam[]) {
    this.records = [...beams];
    this.stack = [...beams];
  }

  public push(beams: Beam[]): void {
    for (const beam of beams) {
      const existingBeam = this.records.find((recordBeam) => recordBeam.isSame(beam));
      if (existingBeam) {
        return;
      }
  
      this.stack.push(beam);
      this.records.push(beam);
    }
  }

  public pop(): Beam | undefined {
    return this.stack.pop();
  }
}

class Beam {
  private origin: Position;
  private direction: Direction;

  constructor (origin: Position, direction: Direction) {
    this.origin = origin;
    this.direction = direction;
  }

  public isSame(beam: Beam) {
    return beam.origin.row === this.origin.row && beam.origin.column === this.origin.column && beam.direction === this.direction
  }

  public getOrigin(): Position {
    return this.origin;
  }

  public getDirection(): Direction {
    return this.direction;
  }

  public getPositionRow (): number {
    return this.origin.row;
  }

  public getPositionColumn (): number {
    return this.origin.column;
  }
}

abstract class Mirror {
  protected position: Position;
  protected symbol: string;
  protected redirects: Record<Direction, Direction[]>;

  constructor (symbol: string, position: Position, redirects: Record<Direction, Direction[]>) {
    this.symbol = symbol;
    this.position = position;
    this.redirects = redirects;
  }

  public reflect(originDirection: Direction): Beam[] {
    return this.redirects[originDirection].map(redirect => new Beam(this.position, redirect));
  }

  public getSymbol (): string {
    return this.symbol;
  }

  public getPosition (): Position {
    return this.position;
  }

  public getPositionRow (): number {
    return this.position.row;
  }

  public getPositionColumn (): number {
    return this.position.column;
  }
}

class MirrorLeft extends Mirror {
  constructor (position: Position) {
    const redirects: Record<Direction, Direction[]> = {
      "LEFT": ["UP"],
      "RIGHT": ["DOWN"],
      "DOWN": ["RIGHT"],
      "UP": ["LEFT"]
    }
    super("\\", position, redirects);
  }
}

class MirrorRight extends Mirror {
  constructor (position: Position) {
    const redirects: Record<Direction, Direction[]> = {
      "LEFT": ["DOWN"],
      "RIGHT": ["UP"],
      "DOWN": ["LEFT"],
      "UP": ["RIGHT"]
    }
    super("/", position, redirects);
  }
}

class MirrorHorizontal extends Mirror {
  constructor (position: Position) {
    const redirects: Record<Direction, Direction[]> = {
      "LEFT": ["LEFT"],
      "RIGHT": ["RIGHT"],
      "DOWN": ["LEFT", "RIGHT"],
      "UP": ["LEFT", "RIGHT"]
    }
    super("-", position, redirects);
  }
}

class MirrorVertical extends Mirror {
  constructor (position: Position) {
    const redirects: Record<Direction, Direction[]> = {
      "LEFT": ["DOWN", "UP"],
      "RIGHT": ["DOWN", "UP"],
      "DOWN": ["DOWN"],
      "UP": ["UP"]
    } 
    super("|", position, redirects);
  }
}

const mirrorFactory = (symbol, position): Mirror | null => {
  const mirrorTypes = {
    '\\': MirrorLeft, 
    '/': MirrorRight, 
    '-': MirrorHorizontal, 
    '|': MirrorVertical
  };

  const mirrorType = mirrorTypes[symbol];
  if (mirrorType) {
    return new mirrorType(position)
  }

  return null;
}

const findMirrors = (layout): Mirror[] => {
  const mirrors: Mirror[] = [];
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

const findNextMirror = (mirrors: Mirror[], beam: Beam): Mirror | null => {
  const directionRules = {
    "RIGHT": (mirror: Mirror, beam: Beam, currentClosestMirror: Mirror) => (mirror.getPositionRow() === beam.getPositionRow()) && (mirror.getPositionColumn() > beam.getPositionColumn()) && (!currentClosestMirror || currentClosestMirror.getPositionColumn() > mirror.getPositionColumn()),
    "LEFT": (mirror: Mirror, beam: Beam, currentClosestMirror: Mirror) => (mirror.getPositionRow() === beam.getPositionRow()) && (mirror.getPositionColumn() < beam.getPositionColumn()) && (!currentClosestMirror || currentClosestMirror.getPositionColumn() < mirror.getPositionColumn()),
    "DOWN": (mirror: Mirror, beam: Beam, currentClosestMirror: Mirror)=> (mirror.getPositionColumn() === beam.getPositionColumn()) && (mirror.getPositionRow() > beam.getPositionRow()) && (!currentClosestMirror || currentClosestMirror.getPositionRow() > mirror.getPositionRow()),
    "UP": (mirror: Mirror, beam: Beam, currentClosestMirror: Mirror) => (mirror.getPositionColumn() === beam.getPositionColumn()) && (mirror.getPositionRow() < beam.getPositionRow()) && (!currentClosestMirror || currentClosestMirror.getPositionRow() < mirror.getPositionRow()),
  }

  let currentClosestMirror = null;
  const directionRule = directionRules[beam.getDirection()];
  for (const mirror of mirrors) {
    if (directionRule(mirror, beam, currentClosestMirror)) {
      currentClosestMirror = mirror;
    }
  }

  return currentClosestMirror;
}

class LightningTilesCounter {
  private lights: Set<string>;
  constructor () {
    this.lights = new Set();
  }

  public setLightenedTiles (layoutLimits, beam: Beam, nextMirror: Mirror | null) {
    const borderDirectionRules = {
      "RIGHT": (layoutLimits, start: Position) => ({ row: start.row, column: layoutLimits.column }),
      "LEFT": (_layoutLimits, start: Position) => ({ row: start.row, column: 0 }),
      "DOWN": (layoutLimits, start: Position) => ({ row: layoutLimits.row, column: start.column }),
      "UP": (_layoutLimits, start: Position) => ({ row: 0, column: start.column })
    }

    const origin = beam.getOrigin();
    let end;
    if (!nextMirror) {
      end = borderDirectionRules[beam.getDirection()](layoutLimits, origin);
    } else {
      end = nextMirror.getPosition();
    }
    
    // TODO to refactor
    if (origin.row === end.row) {
      const lowest = origin.column < end.column ? origin.column : end.column;
      const highest = origin.column < end.column ? end.column : origin.column;

      for (let i = lowest; i <= highest; i++) {
        this.lights.add(`${origin.row}, ${i}`);
      }
    } else {
      const lowest = origin.row < end.row ? origin.row : end.row;
      const highest = origin.row < end.row ? end.row : origin.row;

      for (let i = lowest; i <= highest; i++) {
        this.lights.add(`${i}, ${origin.column}`);
      }
    }
  }

  public getNbLightenedTiles(): number {
    return this.lights.size;
  }
}

const generateStartingBeams = (layoutLimits: Position): Beam[] => {
  const upBeams = Array.from(new Array(layoutLimits.column + 1), (_e, i) => new Beam({ row: -1, column: i}, "DOWN"));
  const downBeams = Array.from(new Array(layoutLimits.column + 1), (_e, i) => new Beam({ row: layoutLimits.row + 1, column: i}, "UP"));
  const leftBeams = Array.from(new Array(layoutLimits.row + 1), (_e, i) => new Beam({ row: i, column: -1}, "RIGHT"));
  const rightBeams = Array.from(new Array(layoutLimits.row + 1), (_e, i) => new Beam({ row: i, column: layoutLimits.column + 1}, "LEFT"));

  return [...upBeams, ...downBeams, ...leftBeams, ...rightBeams];
}

const start = (mirrors: Mirror[], beamStack: BeamStack, layoutLimits: Position, lightningTilesCounter: LightningTilesCounter): number => {
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
}

// const doc = await loadDocument();
const layout = parser(test);
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

  // -1 because the first beam started off bound
  tries.push(nbLightenedTiles - 1);
}

console.log(Math.max(...tries))