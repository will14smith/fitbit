import Sequelize from 'sequelize';

export default function (db) {
  const Sleep = db.define('Sleep', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,

    awakeCount: Sequelize.INTEGER,
    awakeDuration: Sequelize.INTEGER,
    awakeningsCount: Sequelize.INTEGER,

    efficiency: Sequelize.INTEGER,
    isMainSleep: Sequelize.BOOLEAN,

    minutesAfterWakeup: Sequelize.INTEGER,
    minutesAsleep: Sequelize.INTEGER,
    minutesAwake: Sequelize.INTEGER,
    minutesToFallAsleep: Sequelize.INTEGER,

    restlessCount: Sequelize.INTEGER,
    restlessDuration: Sequelize.INTEGER,
  });

  const SleepMinutes = db.define('SleepMinutes', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    value: Sequelize.INTEGER,
  });

  Sleep.hasMany(SleepMinutes, { as: 'minutes' });

  return {
    Sleep,
    SleepMinutes
  }
}
