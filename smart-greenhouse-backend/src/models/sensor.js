'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sensor extends Model {
    static associate(models) {
      // Sensor có nhiều SensorData, dùng đúng foreignKey
      Sensor.hasMany(models.SensorData, { foreignKey: 'SDsensorId' });
      // 1-N: Rule – Sensor
      Sensor.hasMany(models.Rule, { foreignKey: 'sensorID' });
    }
  }
  Sensor.init(
    {
      sensorName: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Sensor',
      tableName: 'Sensor',
      freezeTableName: true,
    },
  );
  return Sensor;
};
