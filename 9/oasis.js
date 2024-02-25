import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./oasis.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`;

const parser = (doc) => {
  return doc.split('\n').map(line => line.split(' ').map(Number));
}

const generateNextSequence = (sequence) => {
  const sequenceDifferences = []
  for (let i = 0; i < sequence.length - 1; i++) {
    sequenceDifferences[i] = sequence[i + 1] - sequence[i];
  }
  return sequenceDifferences;
}

const processSequence = (sequence) => {
  const decompositions = [sequence];
  while (decompositions.at(-1).some(value => value !== 0)) {
    decompositions.push(generateNextSequence(decompositions.at(-1)));
  }

  const reversedDecompositions = decompositions.map(decomposition => decomposition.toReversed());

  for (let i = reversedDecompositions.length - 1; i >= 0; i--) {
     const decomposition = reversedDecompositions[i];
     decomposition[decomposition.length] = reversedDecompositions[i + 1] ? reversedDecompositions[i].at(-1) - reversedDecompositions[i + 1].at(-1) : reversedDecompositions[i].at(-1);
   }
  
  return reversedDecompositions[0].at(-1);
}

const document = await loadDocument();
const sequences = parser(document);

console.log(sequences.reduce((acc, sequence) => acc + processSequence(sequence), 0));
