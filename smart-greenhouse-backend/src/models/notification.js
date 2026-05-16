'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // N-N: Notification – User (qua UserNotif)
      Notification.belongsToMany(models.Users, {
        through: models.UserNotif,
        foreignKey: 'notifID',
        otherKey: 'userID',
      });

      // 1-N: Notification – SetRule
      Notification.belongsTo(models.setRule, {
        foreignKey: 'notifID',
      });
    }
  }
  Notification.init(
    {
      title: DataTypes.STRING,
      message: DataTypes.STRING,
      type: DataTypes.STRING,
      setID: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'Notification',
    },
  );
  return Notification;
};
