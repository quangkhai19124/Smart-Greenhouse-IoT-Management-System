'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 1-N: Device – Schedule
      Device.hasMany(models.Schedule, { foreignKey: 'dev_Id' });

      // 1-N: Device – Log
      Device.hasMany(models.Log, { foreignKey: 'dev_Id' });

      // 1-N: Device – SetRule
      Device.hasMany(models.setRule, { foreignKey: 'dev_Id' });
    }
  }
  Device.init(
    {
      mode: DataTypes.STRING,
      description: DataTypes.STRING,
      status: DataTypes.STRING,
      deviceName: DataTypes.STRING,
      adaDevName: DataTypes.STRING,
      power: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Device',
      tableName: 'Device',
    },
  );
  return Device;
};
