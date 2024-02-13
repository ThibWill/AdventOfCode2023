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

const findSpaceExpended1D = (space) => {
  return space.reduce((acc, spaceLine, coord) => {
    if (!spaceLine.includes('#')) {
      acc.push(coord);
    }
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

const findSpaceExpended2D = (spaceRows) => {
  const spaceExpended = {
    rows: findSpaceExpended1D(spaceRows)
  };
  const turnedSpace = turnSpace(spaceRows);

  return {
    ...spaceExpended,
    columns: findSpaceExpended1D(turnedSpace)
  }
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

const findDistanceStars = (stars, spaceExpended) => {
  let distances = 0;
  for (const star of stars) {
    distances += stars.reduce((acc, otherStar) => {
      const starRow = otherStar[0];
      const starColumn = otherStar[1];
      const otherStarRow = star[0];
      const otherStarColumn = star[1];

      let distanceTwoStar = spaceExpended.rows.reduce((acc, spaceExpendedRow) => {
        if (starRow < spaceExpendedRow && otherStarRow > spaceExpendedRow) {
          acc += 1;
        } else if (starRow > spaceExpendedRow && otherStarRow < spaceExpendedRow) {
          acc += 1;
        }
        return acc;
      }, 0);

      distanceTwoStar += spaceExpended.columns.reduce((acc, spaceExpendedColumn) => {
        if (starColumn < spaceExpendedColumn && otherStarColumn > spaceExpendedColumn) {
          acc += 1;
        } else if (starColumn > spaceExpendedColumn && otherStarColumn < spaceExpendedColumn) {
          acc += 1;
        }
        return acc;
      }, 0);

      distanceTwoStar *= 999999;

      return acc + distanceTwoStar + Math.abs(otherStar[0] - star[0]) + Math.abs(otherStar[1] - star[1]);
    }, 0)
  }
  console.log(distances / 2)
}

const beforeSpace = await loadDocument();
const spaceRows = beforeSpace.split('\n');
const spaceExpended = findSpaceExpended2D(spaceRows);
const stars = findStars(spaceRows);
findDistanceStars(stars, spaceExpended)