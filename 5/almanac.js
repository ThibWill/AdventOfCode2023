import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function loadDocument() {
  try {
    const filePath = resolve('./almanac.txt');
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return contents.trim()
  } catch (err) {
    console.error(err.message);
  }
}

const test = 
`seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`

const parser = (doc) => doc.split('\n\n');

const extractSeeds = (topLine) => {
  const ranges = topLine.replace('seeds: ', '').trim().split(' ').map(Number);
  console.log(ranges)
  const seeds = ranges.reduce((acc, curr, i) => {
    console.log(acc)
    if (i % 2 !== 0) {
      return acc;
    }

    const rangeBottom = curr;
    const lengthRange = ranges[i + 1];
    for (let i = 0; i < lengthRange; i++) {
      acc.add(rangeBottom + i);
    }
    return acc
  }, new Set())

  return Array.from(seeds)
};

const findMapConversion = (travel, conversion) => {
  const characteristicRelatedToCondition = conversion.find(characteristic => characteristic[1] <= travel && characteristic[1] + characteristic[2] > travel);
  if (characteristicRelatedToCondition) {
    return characteristicRelatedToCondition[0] + (travel - characteristicRelatedToCondition[1])
  }
  return travel
}

const findMapsConversion = (maps) => maps.map(findMapConversion);

const travelConversions = (seed, conversions) => {
  let travel = seed;
  for (const conversion of conversions) {
    travel = findMapConversion(travel, conversion);
  }
  return travel;
}

const findLocations = (almanac) => {
  const seeds = extractSeeds(almanac[0]);
  console.log(seeds);
  const conversions = almanac.slice(1).map(m => m.split('map:\n')[1].split('\n').map(characteristic => characteristic.split(' ').map(Number)));
  return Math.min(...seeds.map(seed => travelConversions(seed, conversions)))

}

const almanac = await loadDocument();
console.log(findLocations(parser(almanac)));
