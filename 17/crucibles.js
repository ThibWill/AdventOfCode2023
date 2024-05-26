import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./crucibles.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`;

const testMini = 
`241
321
325`;

const parser = (doc) =>  doc.split('\n').map(line => line.split(''));

const loadGraphData = (data) => {
  const graph = new Map();
  // Start
  let vertexQueue = [{ row: 0, column: 0 }]
  const turnAroundDirection = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT"
  }

  while (vertexQueue.length) {
    const currentVertex = vertexQueue.pop();
    console.log(vertexQueue.length);

    if (graph.has(JSON.stringify(currentVertex))) {
      continue;
    }

    let newCoordsVertex = [
      { row: currentVertex.row - 1, column: currentVertex.column, direction: "UP" },
      { row: currentVertex.row + 1, column: currentVertex.column, direction: "DOWN" },
      { row: currentVertex.row, column: currentVertex.column - 1, direction: "LEFT" },
      { row: currentVertex.row, column: currentVertex.column + 1, direction: "RIGHT" }
    ];

    let edges = [];
    for (const { row, column, direction } of newCoordsVertex) {
      if (row < 0 || column < 0 || row >= data.length || column >= data[0].length) {
        continue;
      }

      // No turnaround
      if (turnAroundDirection[direction] === currentVertex.direction) {
        continue;
      }

      let times;
      if (direction === currentVertex.direction) {
        // Maximum 10 blocks in one direction
        if (currentVertex.times >= 10) {
          continue;
        }

        // End
        if ((row === (data.length - 1) && column === (data[0].length - 1)) && currentVertex.times >= 4) {
          const endVertex = { row, column };
          vertexQueue.push(endVertex)
          edges.push({ to: JSON.stringify(endVertex), weight: Number(data[row][column]) })
        }

        times = currentVertex.times + 1;
      } else {
        // Have to do at least 4 blocks in one direction
        if (currentVertex.times < 4) {
          continue;
        }

        times = 1;
      }

      if (row === (data.length - 1) && column === (data[0].length - 1)) {
        continue;
      }

      const newVertex = { row, column, direction, times };
      vertexQueue.push(newVertex);
      edges.push({ to: JSON.stringify(newVertex), weight: Number(data[row][column]) })
    }
    
    graph.set(JSON.stringify(currentVertex), edges);
  }
  return graph;
}


const dijkstraSearchShortestPath = (graph, startWeight) => {
  const previous = new Map();
  const distances = new Map();
  let priorityQueue = [];

  for (let key of graph.keys()) {
    previous.set(key, -1);
    distances.set(key, Infinity);
  }
  priorityQueue.push([0, startWeight]);
  distances.set(startWeight, 0);

  while (priorityQueue.length) {
    const [_distance, lowest] = priorityQueue.shift();
    const edges = graph.get(lowest);
    for (const edge of edges) {
      const destination = edge.to;
      const distance = distances.get(lowest) + edge.weight;

      if (distance < distances.get(destination)) {
        distances.set(destination, distance);
        priorityQueue.push([distances.get(destination), destination]);
      }
    }

    priorityQueue = priorityQueue.toSorted((a, b) => a[0] - b[0]);
  }

  return {
    distances,
    previous
  }
}

function buildPath(previous, end) {
  const path = ["end"];
  let current = previous.get(end);
  console.log(current)
  while(current !== -1) {
    path.push(current);
    current = previous.get(current);
  }
  path.push("start");
  return path;
}

const doc = await loadDocument();
const parsed = parser(doc);
const graph = loadGraphData(parsed);

const start = '{"row":0,"column":0}';
const end = JSON.stringify({ row: parsed.length - 1, column: parsed[0].length - 1 });

const time = console.time();
const { distances, previous } = dijkstraSearchShortestPath(graph, start);
console.timeEnd(time);


console.log(distances.get(end))