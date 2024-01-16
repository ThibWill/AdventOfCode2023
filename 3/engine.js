const test = 
`467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`;

const test2 =
`.........144&.36.....216.........*...........................&.730..........201..581.704.........$......715.............=......*.......%....
...349..............*....598...949.........189....981.....#.............524...................*............=................440...847.......
.................967....#..........999*6..%.........-......604............&.189.626...#774.159.647....................168.........../...329.`;

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./schema.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}


const parser = (doc) => {
  const lines = doc.split('\n');
  return lines;
}

/*const checkPartNumber = (schema, numberDetected) => {
  const numberLength = numberDetected.value.length;
  const schemaRowLength = schema[0]?.length || 0;

  for (let i = 0; i < numberLength; i++) {
    const leftBound = numberDetected.x - 1 >= 0 ? numberDetected.x - 1 : 0
    const rightBound = numberDetected.x + numberLength + 1 < schemaRowLength ? numberDetected.x + numberLength + 1 : schemaRowLength - 1

    const top = schema[numberDetected.y - 1]?.slice(leftBound, rightBound) || '';
    const bottom = schema[numberDetected.y + 1]?.slice(leftBound, rightBound) || '';
    const right = schema[numberDetected.y]?.[numberDetected.x + numberLength] || '';
    const left = schema[numberDetected.y]?.[numberDetected.x - 1] || '';
    
    return !/^[\d|\.]+$/.test(`${top}${bottom}${right}${left}`)
  }
}*/

const findNumbersLine = (line, lineNumber) => {
  const numbersDetected = [];
  
  const numberRegex = /(\d+)/g
  let match;
  while ((match = numberRegex.exec(line)) !== null) {
    numbersDetected.push({
      positions: Array.from(Array(match[0].length), (_p, i) => [match.index + i, lineNumber]),
      value: match[0]
    });
  }

  return numbersDetected;
}

const findNumbersSchema = (schema) => {
  const numbersDetected = [];
  for (let i = 0; i < schema.length; i++) {
    numbersDetected.push(...findNumbersLine(schema[i], i));
  }
  return numbersDetected;
}

const findStarsSchema = (schema) => {
  const gearRegex = /(\*)/g
  return schema.reduce((acc, line, lineIndex) => {
    let match;
    while ((match = gearRegex.exec(line)) !== null) {
      acc.push([match.index, lineIndex])
    }
    return acc
  }, [])
}

const findGearsSchema = (schema) => {
  const stars = findStarsSchema(schema);
  const numbers = findNumbersSchema(schema);

  const numbersAroundStars = [];
  for (let star of stars) {
    const starPosX = star[0];
    const starPosY = star[1];
    numbersAroundStars.push(numbers.filter(number => {
      return number?.positions?.some(position => {
        const numPosX = position[0];
        const numPosY = position[1];
        if (starPosX - 1 <= numPosX && starPosX + 1 >= numPosX && starPosY - 1 <= numPosY && starPosY + 1 >= numPosY) {
          return true;
        }
        return false
      }) || false
    }))
  }
  return numbersAroundStars.filter(numbers => numbers.length === 2)
}

const doc = await loadDocument();
const schema = parser(doc);
const gears = findGearsSchema(schema)
console.log(gears.reduce((acc, gear) => {
  return acc + (gear[0].value * gear[1].value);
}, 0))