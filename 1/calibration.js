import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadCalibrationDocument() {
  try {
    const filePath = resolve('./calibrationDoc.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const testCalibrationDoc = 
  `1abc2
  pqr3stu8vwx
  a1b2c3d4e5f
  treb7uchet`;

const test2CalibrationDoc = 
  `two1nine
  eightwothree
  abcone2threexyz
  xtwone3four
  4nineeightseven2
  zoneight234
  7pqrstsixteen`;

const extractDigits = (str) => str.match(/\d/g)

const findCalibrationValue = (calibration) => {
  const digits = extractDigits(calibration)
  const numberDigits = digits.length

  if (numberDigits === 0) {
    return '0'
  } else if (numberDigits === 1) {
    return `${digits[0]}${digits[0]}`
  } 
  return `${digits[0]}${digits[numberDigits - 1]}`
}

const findSumCalibrationValues = (calibrationValues) => {
  return calibrationValues
    .map(Number)
    .reduce((acc, num) => acc + num, 0)
}

const calibrationDocParser = (doc) => doc.split('\n')

const replaceWordsToNumbers = (line) => {
  const digits = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ]

  return digits.reduce(
    (acc, word, index) => acc.replaceAll(word, (index + 1) + word),
    line
  ).split("")
   .map(Number)
   .filter(Boolean)
   .join('');
}

const calibrationDocument = await loadCalibrationDocument()
const calibrations = calibrationDocParser(calibrationDocument)
const calibrationsCorrected = calibrations.map(calibration => replaceWordsToNumbers(calibration))
const calibrationsValues = calibrationsCorrected.map(calibration => findCalibrationValue(calibration))
const sumCalibrationValues = findSumCalibrationValues(calibrationsValues)
console.log(sumCalibrationValues)