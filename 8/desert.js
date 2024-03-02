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

const findStartNodesNames = (nodes) => {
  return Object.keys(nodes).filter(node => node.endsWith('A'));
}

const findEndNodesNames = (nodes) => {
  return Object.keys(nodes).filter(node => node.endsWith('Z'));
}

const document = await loadDocument();
const { 
  instructions, 
  hashMapNodes
} = parser(document)

let startNodesNames = findStartNodesNames(hashMapNodes);
let endNodesNames = findEndNodesNames(hashMapNodes);

const findCloserEndingNode = (hashMapNodes, startNodeName, endNodeNames) => {

  let nbSteps = 0;
  let currentNodeName = startNodeName;
  
  while (true) {
    const instruction = instructions[nbSteps % instructions.length];
    nbSteps += 1;
    
    currentNodeName = hashMapNodes[currentNodeName][instruction];
    
    if (endNodeNames.includes(currentNodeName)) {
      break;
    }
  }

  return {
    closerEndNode: currentNodeName,
    nbSteps
  }
}

const mapCloserEndNode = {};
for (let startNodeName of startNodesNames) {
  mapCloserEndNode[startNodeName] = findCloserEndingNode(hashMapNodes, startNodeName, endNodesNames);
}

const nbSteps = Object.values(mapCloserEndNode).map(end => end.nbSteps).map(Number);
const nbRepetitions = Array(nbSteps.length).fill(1);

let stop = false;
while (!stop) {
  let minTotalNbSteps;
  let minNbStepsKey;
  stop = true;
  for (let i = 0; i < nbSteps.length; i++) {
    const totalNbSteps = nbSteps[i] * nbRepetitions[i];
    if ((minNbStepsKey !== undefined) && minTotalNbSteps !== totalNbSteps) {
      stop = false;
    }

    if ((minNbStepsKey === undefined) || totalNbSteps < minTotalNbSteps) {
      minTotalNbSteps = totalNbSteps;
      minNbStepsKey = i;
    }
  }

  if (!stop) {
    nbRepetitions[minNbStepsKey] += 1;
  }
  minNbStepsKey = undefined;
}

console.log(nbSteps, nbRepetitions);


