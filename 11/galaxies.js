import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./galaxy.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

const addSpace = (space) => {
  return space.reduce((acc, curr, index) => {
    if (!curr.includes('#')) {
      acc.push(curr);
    }
    acc.push(curr);
    return acc;
  }, [])
}

const turnSpace = (spaceRows) => {
  const turnedSpace = [];
  for (let i = 0; i < spaceRows.length; i++) {
    const row = spaceRows[i];
    for (let j = 0; j < row.length; j++) {
      if (!turnedSpace[j]) {
        turnedSpace[j] = row[j];
        continue;
      }
      turnedSpace[j] += row[j]
    }
  }
  return turnedSpace;
}

const spaceExpends = (space) => {
  const spaceRows = space.split('\n');

  const space1 = addSpace(spaceRows);
  const turnedSpace = turnSpace(space1);
  const space2 = addSpace(turnedSpace);
  return turnSpace(space2);
}

const findStars = (space) => {
  console.log('SPACE', space)
  const stars = [];
  for (let i = 0; i < space.length; i++) {
    for (let j = 0; j < space[i].length; j++) {
      if (space[i][j] === '#') {
        stars.push([i, j])
      }
    }
  }
  return stars;
}

const findDistanceStars = (stars) => {
  let distances = 0;
  for (const star of stars) {
    distances += stars.reduce((acc, otherStar) => {
      return acc + Math.abs(otherStar[0] - star[0]) + Math.abs(otherStar[1] - star[1]);
    }, 0)
  }
  console.log(distances / 2)
}

const beforeSpace = await loadDocument();
const expendedSpace = spaceExpends(beforeSpace);
const stars = findStars(expendedSpace);
findDistanceStars(stars)