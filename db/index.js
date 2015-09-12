import Sequelize from 'sequelize';
// import models
import calorieFactory from './Calories';
import distanceFactory from './Distance';
import elevationFactory from './Elevation';
import floorsFactory from './Floors';
import heartRateFactory from './HeartRate';
import stepFactory from './Steps';

const db = {
  setup(args) {
    db.sequelize = new Sequelize(`mysql://${args.db_user}:${args.db_pass}@localhost/${args.db_name}`, {
      logging: false,
      // write-only, so this is safe.
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
    });

    db.Calories = calorieFactory(db.sequelize);
    db.Distance = distanceFactory(db.sequelize);
    db.Elevation = elevationFactory(db.sequelize);
    db.Floors = floorsFactory(db.sequelize);
    db.HeartRate = heartRateFactory(db.sequelize);
    db.Steps = stepFactory(db.sequelize);

    return db.sequelize.sync({ force: true });
  }
};

export default db;
