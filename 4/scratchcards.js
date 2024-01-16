import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./cards.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`;

const parser = (doc) => doc.split('\n');

const findWinningNumbers = (line) => {
  const firstPart = line.split('|')[0] || '';
  const winningNumbers = firstPart.split(':')[1]?.trim() || '';
  return winningNumbers.split(' ').filter(Boolean);
}

const findDrawNumbers = (line) => {
  return (line.split('|')[1] || '').trim().split(' ').filter(Boolean);
}

const calculateWorthLine = (line) => {
  const winningNumbers = findWinningNumbers(line);
  const drawNumbers = findDrawNumbers(line);
  
  const matches = winningNumbers.filter(winningNumber => drawNumbers.includes(winningNumber)); 
  const result = Math.pow(2, matches.length - 1);
  return result >= 1 ? result : 0;
}

const doc = await loadDocument()
// console.log()
const cards = parser(doc);
console.log(cards.reduce((acc, line) => calculateWorthLine(line) + acc, 0))