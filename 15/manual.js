import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./manual.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' })
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7";

const parser = (doc) => {
  return doc.split(',');
}

const hash = (step) => {
  let currentValue = 0;
  for (let i = 0; i < step.length; i++) {
    const char = step[i];
    currentValue = ((currentValue + char.charCodeAt(0)) * 17) % 256;
  }
  return currentValue;
}

const doc = await loadDocument();
const sequence = parser(doc);
console.log(sequence.reduce((acc, curr) => acc + hash(curr), 0));