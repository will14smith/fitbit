import Sequelize from 'sequelize';

export default function (db) {
  return db.define('Steps', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    count: Sequelize.INTEGER,
  })
}
