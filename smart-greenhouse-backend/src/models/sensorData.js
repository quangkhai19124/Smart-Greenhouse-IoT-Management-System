'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SensorData extends Model {
    static associate(models) {
      // SensorData thuộc về Sensor qua SDsensorId
      SensorData.belongsTo(models.Sensor, { foreignKey: 'SDsensorId' });
    }
  }
  SensorData.init(
    {
      SDsensorId: DataTypes.INTEGER,
      SDataId: DataTypes.INTEGER,
      time: DataTypes.DATE,
      value: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: 'SensorData',
      tableName: 'SensorData',
      freezeTableName: true,
    },
  );
  return SensorData;
};
