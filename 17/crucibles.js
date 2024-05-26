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

    let newCoordsVertex = [
      { row: currentVertex.row - 1, column: currentVertex.column, direction: "UP" },
      { row: currentVertex.row + 1, column: currentVertex.column, direction: "DOWN" },
      { row: currentVertex.row, column: currentVertex.column - 1, direction: "LEFT" },
      { row: currentVertex.row, column: currentVertex.column + 1, direction: "RIGHT" }
    ];

    let newVertexes = [];
    for (const { row, column, direction } of newCoordsVertex) {
      if (row < 0 || column < 0 || row >= data.length || column >= data[0].length) {
        continue;
      }

      // No turnaround
      if (turnAroundDirection[direction] === currentVertex.direction) {
        continue;
      }

      if (row === (data.length - 1) && column === (data[0].length - 1) && ((direction !== currentVertex.direction) || (direction === currentVertex.direction && currentVertex.times < 3))) {
        // End
        newVertexes.push({ row , column });
        continue;
      } 

      if (direction === currentVertex.direction) {
        newVertexes = newVertexes.concat(Array.from(new Array(3 - currentVertex.times), (_e, i) => ({ row, column, direction, times: i + currentVertex.times + 1 })));
      } else {
        newVertexes = newVertexes.concat(Array.from(new Array(3), (_e, i) => ({ row, column, direction, times: i + 1 })));
      }
    }
    
    vertexQueue = vertexQueue.concat(newVertexes.filter(vertex => !graph.has(JSON.stringify(vertex))));

    const edges = newVertexes.map(vertex => ({ to: JSON.stringify(vertex), weight: Number(data[vertex.row][vertex.column]) }));
    graph.set(JSON.stringify(currentVertex), edges);
  }
  return graph;
}


const dijkstraSearchShortestPath = (graph, startWeight) => {
  const seen = new Map();
  const previous = new Map();
  const distances = new Map();

  for (let key of graph.keys()) {
    seen.set(key, false);
    previous.set(key, -1);
    distances.set(key, Infinity);
  }
  distances.set(startWeight, 0);

  const hasUnseen = (seen, distances) => {
    for (const [key, value] of seen.entries()) { 
      if (value === false && distances.get(key) < Infinity) {
        return true;
      }
    }
    return false;
  }

  const getLowest = (seen, distances) => {
    let lowestVertex;
    let lowestDistance = Infinity;
    for (const [key, value] of seen.entries()) {
      if (value === true) {
        continue;
      }

      const currentDistance = distances.get(key);
      if (currentDistance < lowestDistance) {
        lowestVertex = key;
        lowestDistance = currentDistance
      }
    }
    return lowestVertex;
  }

  while (hasUnseen(seen, distances)) {
    const lowest = getLowest(seen, distances);
    const edges = graph.get(lowest);
    
    seen.set(lowest, true)

    for (const edge of edges) {
      const destination = edge.to;
      if (seen.get(destination) === true) {
        continue;
      }

      const distance = distances.get(lowest) + edge.weight;
      if (distance < distances.get(destination)) {
        distances.set(destination, distance);
        previous.set(destination, lowest);
      }
    }
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

const { distances, previous } = dijkstraSearchShortestPath(graph, start);

//const path = buildPath(previous, end);
// console.log(path);

console.log(distances.get(end))