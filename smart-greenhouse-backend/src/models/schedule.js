'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // N-1: Schedule – Device
      Schedule.belongsTo(models.Device, { foreignKey: 'dev_Id' });
    }
  }
  Schedule.init(
    {
      timeStart: DataTypes.TIME,
      timeEnd: DataTypes.TIME,
      status: DataTypes.STRING,
      actionDay: DataTypes.STRING,
      power: DataTypes.INTEGER,
      dev_Id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Schedule',
      tableName: 'Schedule',
    },
  );
  return Schedule;
};
