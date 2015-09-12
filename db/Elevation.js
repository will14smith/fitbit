import Sequelize from 'sequelize';

export default function (db) {
  return db.define('Elevation', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    count: Sequelize.INTEGER,
  })
}
