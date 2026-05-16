'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Log.belongsTo(models.Device, { foreignKey: 'dev_Id' });
    }
  }
  Log.init(
    {
      dev_Id: DataTypes.INTEGER,
      value: DataTypes.STRING,
      time: DataTypes.DATE,
      description: DataTypes.STRING,
      mode: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Log',
      tableName: 'Log',
    },
  );
  return Log;
};
