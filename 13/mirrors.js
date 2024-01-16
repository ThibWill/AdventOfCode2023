import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./terrains.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test =
`#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`;


const parser = (doc) => doc.split('\n\n');

const verifySymmetry = (ground, index) => {
  const lowerIdenticalRowIndex = index;
  const upperIdenticalRowIndex = index + 1;

  const nbLowRows = lowerIdenticalRowIndex;
  const nbHighRows = ground.length - upperIdenticalRowIndex - 1;

  const nbRowsVerify = nbLowRows < nbHighRows ? nbLowRows : nbHighRows;

  for (let i = 1; i <= nbRowsVerify; i++) {
    if (ground[lowerIdenticalRowIndex - i] !== ground[upperIdenticalRowIndex + i]) {
      return false;
    }
  }

  return true;
}

const turnTerrain = (terrainRows) => {
  const turnedTerrain = [];
  for (let i = 0; i < terrainRows.length; i++) {
    const row = terrainRows[i];
    for (let j = 0; j < row.length; j++) {
      if (!turnedTerrain[j]) {
        turnedTerrain[j] = row[j];
        continue;
      }
      turnedTerrain[j] += row[j]
    }
  }
  return turnedTerrain;
}

const findSymmetry = (ground) => {
  for (let i = 0; i < ground.length; i++) {
    if ((ground[i] === ground[i + 1])) {
      if (verifySymmetry(ground, i)) {
        return i + 1;
      }
    }
  }

  return null;
}

const calculateSymmetryTerrain = (terrain) => {
  const terrainRows = terrain.split('\n');
  const horizontalSymmetry = findSymmetry(terrainRows);

  if (horizontalSymmetry) {
    return horizontalSymmetry * 100;
  }

  const terrainCols = turnTerrain(terrainRows);

  const verticalSymetry = findSymmetry(terrainCols);

  return verticalSymetry || 0;
}

const calculateSymmetryTerrains = (terrains) => terrains.reduce((acc, terrain) => {
  acc += calculateSymmetryTerrain(terrain);
  return acc;
}, 0)

const doc = await loadDocument();
const terrains = parser(doc);
console.log(calculateSymmetryTerrains(terrains));