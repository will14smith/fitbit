import Sequelize from 'sequelize';

export default function (db) {
  return db.define('Floors', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    count: Sequelize.INTEGER,
  })
}
