import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./instructions.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`;

const parser = (doc) => {
  const instructions = doc.split("\n");
  return instructions.map(instruction => {
    const [direction, length, color] = instruction.split(' ');
    return {
      direction,
      length: parseInt(length),
      color
    };
  });
}

const correctPointsOffset = (points) => {
  const columnMinValue = Math.min(...points.map(p => p.column));
  const rowMinValue = Math.min(...points.map(p => p.row));

  return points.map(p => 
    ({ 
      row: p.row + Math.abs(rowMinValue),
      column: p.column + Math.abs(columnMinValue)
    })
  )
} 

const generateMap = (instructions) => {
  let row = 0;
  let column = 0;
  let startPoint = { row, column };
  let points = [startPoint];
  for (const instruction of instructions) {
    let endPoint = {};
    switch (instruction.direction) {
      case 'R':
        endPoint = { row: startPoint.row, column: startPoint.column + instruction.length };
        break;
      case 'L':
        endPoint = { row: startPoint.row, column: startPoint.column - instruction.length };
        break;
      case 'D':
        endPoint = { row: startPoint.row + instruction.length, column: startPoint.column };
        break;
      case 'U':
        endPoint = { row: startPoint.row - instruction.length, column: startPoint.column };
        break;
    }
    points.push(endPoint);
    startPoint = endPoint;
  }

  points = correctPointsOffset(points);

  const mapWidth = Math.max(...points.map(p => p.column)) + 3;
  const mapHeight = Math.max(...points.map(p => p.row)) + 3;
  const map = Array.from(new Array(mapHeight), (_e, _i) => new Array(mapWidth).fill('.'));

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const minColumn = Math.min(...[start, end].map(p => p.column)) + 1;
    const minRow = Math.min(...[start, end].map(p => p.row)) + 1;
    for (let j = 0; j < Math.abs(start.row - end.row) + 1; j++) {
      for (let k = 0; k < Math.abs(start.column - end.column) + 1; k++) {
        map[minRow + j][minColumn + k] = '#';
      }
    }
  }

  return map;
}

const doc = await loadDocument();

const instructions = parser(doc);

const map = generateMap(instructions);

// console.log(map.map(c => c.join('')).join('\n'))

const floodMap = (map, startPoint) => {
  const queue = [startPoint];
  while (queue.length)
  {
    const point = queue.pop();
    if (['#', 'V'].includes(map[point[0]][point[1]])) {
      continue;
    }

    map[point[0]][point[1]] = 'V';

    let nextFloodPoints = [
      [point[0] + 1, point[1]],
      [point[0] - 1, point[1]],
      [point[0], point[1] + 1],
      [point[0], point[1] - 1]
    ];

    queue.push(...nextFloodPoints.filter(fp => fp[0] >= 0 && fp[0] < map.length && fp[1] >= 0 && fp[1] < map[0].length))
  }
}

floodMap(map, [0, 0]);

// console.log(map.map(c => c.join('')).join('\n'))

console.log(map.flat().filter(cell => cell === '#' || cell === '.').length)
