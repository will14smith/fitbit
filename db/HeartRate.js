import Sequelize from 'sequelize';

export default function (db) {
  return db.define('HeartRate', {
    dateTime: Sequelize.DATE,
    count: Sequelize.INTEGER,
  })
}
