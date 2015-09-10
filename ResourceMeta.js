export default class ResourceMeta {
  constructor({ name, url, multiDay }) {
    this._name = name;
    this._multiDay = multiDay;
    this._urlFactory = url;
  }

  get name() {
    return this._name;
  }

  get supportsMultipleDays() {
    return this._multiDay;
  }

  generateUrl(input) {
    return this._urlFactory(input);
  }
}

function activityFactory(name) {
  return new ResourceMeta({
    name: `activity-${name}`,
    url: range => `/1/user/-/activities/${name}/date/${range.start}/${range.end}.json`,
    multiDay: true,
  });
}

const activity = {
  calories: activityFactory('calories'),
  caloriesBMR: activityFactory('caloriesBMR'),
  steps: activityFactory('steps'),
  distance: activityFactory('distance'),
  floors: activityFactory('floors'),
  elevation: activityFactory('elevation'),
  minutesSedentary: activityFactory('minutesSedentary'),
  minutesLightlyActive: activityFactory('minutesLightlyActive'),
  minutesFairlyActive: activityFactory('minutesFairlyActive'),
  minutesVeryActive: activityFactory('minutesVeryActive'),
  activityCalories: activityFactory('activityCalories'),
};

function intradayActivityFactory(name, detail = '1min') {
  return new ResourceMeta({
    name: `intraday-activity-${name}`,
    url: date => `/1/user/-/activity/${name}/date/${date}/1d/${detail}.json`,
    multiDay: false,
  });
}

const intradayActivity = {
  calories: intradayActivityFactory('calories'),
  steps: intradayActivityFactory('steps'),
  distance: intradayActivityFactory('distance'),
  floors: intradayActivityFactory('floors'),
  elevation: intradayActivityFactory('elevation'),
};

const heartrate = activityFactory('heart');
const intradayHeartrate = intradayActivityFactory('heart', '1sec');

function sleepFactory(name) {
  return new ResourceMeta({
    name: `sleep-${name}`,
    url: range => `/1/user/-/sleep/${name}/date/${range.start}/${range.end}.json`,
    multiDay: true,
  });
}

const sleep = {
  startTime: sleepFactory('startTime'),
  timeInBed: sleepFactory('timeInBed'),
  minutesAsleep: sleepFactory('minutesAsleep'),
  awakeningsCount: sleepFactory('awakeningsCount'),
  minutesAwake: sleepFactory('minutesAwake'),
  minutesToFallAsleep: sleepFactory('minutesToFallAsleep'),
  minutesAfterWakeup: sleepFactory('minutesAfterWakeup'),
  efficiency: sleepFactory('efficiency'),
};

export {
  activity,
  intradayActivity,
  heartrate,
  intradayHeartrate,
  sleep
}
