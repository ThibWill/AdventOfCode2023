import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./springs.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`;

const parser = (doc) => doc.split('\n');

const findUnknownPartsSpring = (unknownSpring) => {
  return unknownSpring.reduce((acc, part, i) => {
    if (part === '?') {
      acc.push(i);
    }
    return acc;
  }, [])
}

const generatePossibleSprings = (unknownSpring) => {
  const unknownPartsSpring = findUnknownPartsSpring(unknownSpring) || [];
  const nbUnknownParts = unknownPartsSpring.length;

  const possibleSprings = [];
  for (let i = 0; i < 2**nbUnknownParts; i++) {
    let possibleSpring = unknownSpring;
    for (let j = 0; j < nbUnknownParts; j++) {
      possibleSpring[unknownPartsSpring[j]] = (i & 2**j ? '#' : '.');
    }
    possibleSprings.push(possibleSpring.join(''));
  }
  return possibleSprings;
}

const findNbValidSprings = (possibleSprings, groups) => {
  let nbValidSprings = 0;
  for (const possibleSpring of possibleSprings) {
    const damagedGroups = possibleSpring.split('.').filter(part => part.length).map(part => part.length);
    if (damagedGroups.join(',') === groups) {
      nbValidSprings += 1;
    }
  }
  return nbValidSprings;
}

const findNbValidAllSprings = (records) => {
  return records.reduce((acc, springInfos, index) => {
    const springInfosDivided = springInfos.split(' ');
    const unknownSpring = springInfosDivided[0].split('');
    const group = springInfosDivided[1];

    const possibleSprings = generatePossibleSprings(unknownSpring);
    const nbValidSprings = findNbValidSprings(possibleSprings, group);

    acc += nbValidSprings;
    return acc;
  }, 0)
}

const doc = await loadDocument()
const springs = parser(doc);
console.log(findNbValidAllSprings(springs))