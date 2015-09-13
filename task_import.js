import fs from 'fs';
import db from './db';

const importers = { };

export default function (args) {
  const taggedImporters = {
    calories: /intraday-activity-calories/i,
    distance: /intraday-activity-distance/i,
    elevation: /intraday-activity-elevation/i,
    floors: /intraday-activity-floors/i,
    heart: /intraday-activity-heart/i,
    steps: /intraday-activity-steps/i,
    sleep: /intraday-sleep/i,
  }

  Promise.all([
    db.setup(args),
    loadFiles(taggedImporters),
  ]).then(([_, datas]) => {
    console.log(`Loaded ${datas.length} files, beginning import.`);
    console.time("import");
    return pool(datas, x => importers[x.tag](x.data), acc => {
      console.log(`${acc.length} / ${datas.length}`)
    });
  }).then(counts => {
    var count = counts.reduce((acc, val) => acc + val, 0);

    console.log(`Import complete, imported ${count} records.`);
    console.timeEnd("import");
  })

  .catch(err => console.error(err.stack));
}

// importers
function intradayImporter(name, itemMapFn, dbObjFn) {
  return data => {
    const date = data[`activities-${name}`][0]['dateTime'];
    const dataset = data[`activities-${name}-intraday`]['dataset'];

    const records = dataset.map(item => {
      const dateTime = new Date(`${date} ${item.time}`);

      return itemMapFn(item, dateTime);
    });

    return dbObjFn().bulkCreate(records).then(() => {
      return records.length;
    });
  }
}

importers.calories = intradayImporter('calories', (item, time) => ({
  start: time,
  end: addMinute(time),
  level: item.level,
  mets: item.mets,
  count: item.value,
}), () => db.Calories);

importers.distance = intradayImporter('distance', (item, time) => ({
  start: time,
  end: addMinute(time),
  count: item.value,
}), () => db.Distance);

importers.elevation = intradayImporter('elevation', (item, time) => ({
  start: time,
  end: addMinute(time),
  count: item.value,
}), () => db.Elevation);

importers.floors = intradayImporter('floors', (item, time) => ({
  start: time,
  end: addMinute(time),
  count: item.value,
}), () => db.Floors);

importers.heart = intradayImporter('heart', (item, time) => ({
  dateTime: time,
  count: item.value,
}), () => db.HeartRate);

importers.steps = intradayImporter('steps', (item, time) => ({
  start: time,
  end: addMinute(time),
  count: item.value,
}), () => db.Steps);


importers.sleep = data => {
  const sleeps = data['sleep'];

  const minuteFn = (item, minute) => {
    const start = new Date(item.startTime);
    const minuteStart = new Date(`${item.dateOfSleep} ${minute.dateTime}`);
    // assume no sleep is > 24hrs and
    // if the time is before the start time then we should roll over day
    if(minuteStart < start) minuteStart.setDate(minuteStart.getDate() + 1);

    return {
      start: minuteStart,
      end: addMinute(minuteStart),
      value: minute.value,
    };
  };

  const sleepFn = item => {
    const start = new Date(item.startTime);
    const end = new Date(start).setMilliseconds(item.duration);

    return {
      start: start,
      end: end,

      awakeCount: item.awakeCount,
      awakeDuration: item.awakeDuration,
      awakeningsCount: item.awakeningsCount,

      efficiency: item.efficiency,
      isMainSleep: item.isMainSleep,

      minutesAfterWakeup: item.minutesAfterWakeup,
      minutesAsleep: item.minutesAsleep,
      minutesAwake: item.minutesAwake,
      minutesToFallAsleep: item.minutesToFallAsleep,

      restlessCount: item.restlessCount,
      restlessDuration: item.restlessDuration,
    };
  };

  return pool(sleeps, item => {
    return db.Sleep.create(sleepFn(item)).then(sleep => {
      const minutes = item.minuteData.map(minute => sleep.createMinute(minuteFn(item, minute)));

      return Promise.all(minutes).then(() => {
        return 1 + item.minuteData.length;
      });
    });
  }, () => 0, 2).then(results => results.reduce((a, v) => a + v, 0));
};

// file helpers
function loadFiles(taggedPatterns) {
  const results = Object.keys(taggedPatterns).map(tag => {
    return listFiles(taggedPatterns[tag])
      .then(files => Promise.all(files.map(readFile)))
      .then(datas => datas.map(data => ({ tag, data })));
  });

  return Promise.all(results).then(results => [].concat(...results));
}

function listFiles(pattern) {
  return new Promise((resolve, reject) => fs.readdir('downloads', (err, files) => {
    if(err) return reject(err);

    resolve(files
      .filter(x => pattern.test(x))
      .map(x => `downloads/${x}`)
    );
  }));
}
function readFile(file) {
  return new Promise((resolve, reject) => fs.readFile(file, 'utf8', (err, data) => {
    if(err) return reject(err);

    resolve(JSON.parse(data));
  }));
}

// promise helper
function pool(input, fn, progressFn, poolSize = 10) {
  // chunk & iterate
  return chunk(input, poolSize).reduce((promise, items) =>
    // sequence after previous chunk completes
    promise.then(acc => Promise.all(items.map(fn))
      // append the results & report progress
      .then(results => {
        const newAcc = acc.concat(results);
        progressFn(newAcc);
        return newAcc;
      })
    ),
    // initial promise+result
    Promise.resolve([]));
}
function chunk(input, chunkSize) {
  const chunkCount = Math.ceil(input.length / chunkSize);
  const chunks = [];

  for(var i = 0; i < chunkCount; i++) {
      chunks.push(input.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  return chunks;
}

// date helper
function addMinute(date) {
  return new Date(date).setMinutes(date.getMinutes() + 1);
}
