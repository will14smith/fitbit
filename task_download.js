import fs from 'fs';

import * as Resources from './ResourceMeta';
import Api from './ApiRequest';

const dateRange = {
  start: '2015-07-16',
  end: '2015-09-10'
};

const resources = [
  ...values(Resources.activity),
  Resources.heartrate,
  ...values(Resources.sleep),
];
const intradayResources = [
  ...values(Resources.intradayActivity),
  Resources.intradayHeartrate,
];

export default function run(args) {

  const resourceList = [
    ...resources,
    ...(args.intraday ? intradayResources : [])
  ];

  const targets = buildTargetList(resourceList, dateRange);

  console.log(`Have ${targets.length} targets to download...`);

  Api.init(args);
  downloadTarget(targets, 0);
}

function downloadTarget(targets, index) {
  const target = targets[index];

  console.log(`downloading ${target.name} - ${target.url}`)

  Api.get(target.url).then(data => {
    const file = `downloads/${target.name}_${target.dates.start}_${target.dates.end}.json`

    console.log(`saving to ${file}`);

    return Promise.node(cb => fs.writeFile(file, JSON.stringify(data), cb));
  }, err => {
    console.error(`failed download ${target.url}: `, err)
  }).then(() => {
    if(index + 1 < targets.length) {
      // avoid deep stack
      setImmediate(() => downloadTarget(targets, index + 1));
    }
  }, err => {
    console.error('failure: ', err)
  });
}

function values(obj) {
  return Object.keys(obj).map(k => obj[k]);
}

function buildTargetList(resources, dateRange) {
  const targets = [];
  const dates = buildDateList(dateRange);

  for(const resource of resources) {
    if(resource.supportsMultipleDays) {
      targets.push({
        name: resource.name,
        url: resource.generateUrl(dateRange),
        dates: { start: dateRange.start, end: dateRange.end },
      });
    } else {
      targets.push(...(dates.map(date => ({
        name: resource.name,
        url: resource.generateUrl(date),
        dates: { start: date, end: date },
      }))));
    }
  }

  return targets;
}
function dateToString(date) {
  const strMonth = (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
  const strDay = (date.getDate() < 10 ? '0' : '') + date.getDate();

  return date.getFullYear() + '-' + strMonth + '-' + strDay;
}
function buildDateList(dateRange) {
  const start = dateRange.start.split('-').map(x => parseInt(x, 10));
  const end = dateRange.end.split('-').map(x => parseInt(x, 10));
  let date = new Date(start[0], start[1] - 1, start[2]);

  const dates = [];
  dates.push(dateToString(date));

  while(date.getFullYear() !== end[0] || (date.getMonth() + 1) !== end[1] || date.getDate() !== end[2]) {
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    dates.push(dateToString(date));
  }

  return dates;
}
