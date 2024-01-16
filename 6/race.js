const test = 
`Time:      7  15   30
Distance:  9  40  200`;

const races = 
`Time:        40829166
Distance:   277133813491063`;

const parser = (doc) => {
  const lines = doc.split("\n");
  const times = lines[0].replace('Time:', '').trim().split(' ').filter(Boolean).map(Number);
  const distances = lines[1].replace('Distance:', '').trim().split(' ').filter(Boolean).map(Number);

  return {
    times,
    distances
  }
}

const findAllWinningStrategiesNumber = (records) => {
  const allWinningStrategiesNumber = []
  for (let i = 0; i < records['times'].length; i++) {
    const timeRace = records['times'][i];
    const recordDistance = records['distances'][i];

    const winningStrategiesNumber = findWinningStrategiesNumber({
      timeRace,
      recordDistance
    });

    allWinningStrategiesNumber.push(winningStrategiesNumber);
  }

  return allWinningStrategiesNumber;
}

const findWinningStrategiesNumber = ({ timeRace, recordDistance }) => {
  let winningStrategiesNumber = 0;
  for (let i = 0; i < timeRace; i++) {
    const speed = i;
    const distanceRace = (timeRace - i) * speed
    if (distanceRace > recordDistance) {
      winningStrategiesNumber += 1;
    }
  }
  return winningStrategiesNumber;
}

const records = parser(races)

const times = findAllWinningStrategiesNumber(records);
console.log(times.reduce((acc, curr) => acc * curr, 1))
