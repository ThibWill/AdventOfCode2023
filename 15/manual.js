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

const parser = (doc) => {
  return doc.split(',');
}

const hash = (str) => {
  let currentValue = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    currentValue = ((currentValue + char.charCodeAt(0)) * 17) % 256;
  }
  return currentValue;
}

const extractStepInfo = (step) => {
  const regex = /^([a-z]*)([=-])([0-9]*?)$/;

  const info = step.match(regex);

  return {
    lens: {
      label: info[1],
      focal: info[3],
    },
    operation: info[2],
    boxNumber: hash(info[1]),
  }
}

const removeLens = (boxes, boxNumber, labelToRemove) => {
  boxes[boxNumber] = boxes[boxNumber].filter(box => box.label !== labelToRemove);
  return boxes;
} 

const addLens = (boxes, boxNumber, lens) => {
  const { label, focal } = lens;
  const box = boxes[boxNumber];
  const existingLabel = box.findIndex(lens => lens.label === label);
  if (existingLabel !== -1) {
    box[existingLabel].focal = focal;
  } else {
    box.push(lens);
  }
  return boxes;
}

const calculateTotalFocal = (boxes) => {
  let totalFocal = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = 0; j < boxes[i].length; j++) {
      const lens = boxes[i][j];
      totalFocal += (i + 1) * (j + 1) * lens.focal;
    }
  }
  return totalFocal;
}

const test = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7";
const doc = await loadDocument();
const sequence = parser(doc);

let boxes = Array.from(Array(256), () => []);

for (const step of sequence) {
  const { lens, operation, boxNumber } = extractStepInfo(step);
  if (operation === "=") {
    boxes = addLens(boxes, boxNumber, lens);
    continue;
  }

  boxes = removeLens(boxes, boxNumber, lens.label);
}

console.log(calculateTotalFocal(boxes));