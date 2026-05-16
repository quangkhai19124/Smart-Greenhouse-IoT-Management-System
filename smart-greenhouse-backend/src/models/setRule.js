'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class setRule extends Model {
    static associate(models) {
      // N-1: setRule – Device
      setRule.belongsTo(models.Device, { foreignKey: 'dev_Id' });

      // 1-N: setRule – Rule
      setRule.hasMany(models.Rule, { foreignKey: 'setID' });

      // N-1: setRule – Notification
      setRule.hasMany(models.Notification, {
        foreignKey: 'notifID',
        as: 'notification',
      });
    }
  }

  setRule.init(
    {
      power: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('ON', 'OFF'),
        allowNull: false,
        defaultValue: 'OFF',
      },
      emailNotification: {
        type: DataTypes.ENUM('ON', 'OFF'),
        defaultValue: 'ON',
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dev_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      setType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'AUTO_CONTROL',
      },
    },
    {
      sequelize,
      modelName: 'setRule',
      tableName: 'setRule',
      freezeTableName: true,
    }
  );

  return setRule;
};
