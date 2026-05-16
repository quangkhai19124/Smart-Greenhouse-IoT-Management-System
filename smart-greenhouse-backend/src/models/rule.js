'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // N-1: Rule – Sensor
      Rule.belongsTo(models.Sensor, { foreignKey: 'sensorID' });

      // N-1: Rule – SetRule
      Rule.belongsTo(models.setRule, { foreignKey: 'setID' });
    }
  }
  Rule.init(
    {
      logicOperator: DataTypes.STRING,
      operator: DataTypes.STRING,
      condition: DataTypes.FLOAT,
      setID: DataTypes.INTEGER,
      sensorID: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Rule',
      tableName: 'Rule',
    },
  );
  return Rule;
};
