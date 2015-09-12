import Sequelize from 'sequelize';

export default function (db) {
  return db.define('Calories', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    level: Sequelize.INTEGER,
    mets: Sequelize.INTEGER,
    count: Sequelize.DECIMAL,
  })
}
