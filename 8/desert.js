import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./desert.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`;


const parseNode = (textNode) => {
  const regexNode = /([1-9A-Z]{3}) = \(([1-9A-Z]{3}), ([1-9A-Z]{3})\)/;
  const infosNodes = regexNode.exec(textNode);

  return {
    name: infosNodes[1],
    L: infosNodes[2],
    R: infosNodes[3],
  }
}

const parser = (doc) => {
  const lines = doc.split('\n');
  const instructions = lines[0];
  const nodes = lines.splice(2).map(textNode => parseNode(textNode));
  const hashMapNodes = {};
  for (const node of nodes) {
    hashMapNodes[node.name] = {
      L: node.L,
      R: node.R
    }
  }

  return {
    instructions,
    hashMapNodes
  }
}

const getStartingDirections = (nodes) => {
  const startingDirections = [];
  for (const [name, directions] of Object.entries(nodes)) {
    if (name.endsWith('A')) {
      startingDirections.push(directions)
    }
  }
  return startingDirections;
};

const document = await loadDocument();
const { 
  instructions, 
  hashMapNodes
} = parser(document)

let currentChoicesDirection = getStartingDirections(hashMapNodes);
let nbSteps = 0;
let arrived = false;

while (!arrived) {
  const instruction = instructions[nbSteps % instructions.length]
  nbSteps += 1;

  const newNodesName = currentChoicesDirection.map(directions => directions[instruction]);
  if (newNodesName.every(newNodeName => newNodeName.endsWith('Z'))) {
    break;
  }

  currentChoicesDirection = [];
  for (const newNodeName of newNodesName) {
    currentChoicesDirection.push(hashMapNodes[newNodeName]);
  }
}

console.log(nbSteps);
