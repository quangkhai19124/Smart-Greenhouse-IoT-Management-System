'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserNotif extends Model {
    static associate(models) {
      UserNotif.belongsTo(models.Users, { foreignKey: 'userID' });
      UserNotif.belongsTo(models.Notification, { foreignKey: 'notifID' });
    }
  }
  UserNotif.init(
    {
      userID: DataTypes.INTEGER,
      notifID: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM('READ', 'UNREAD'),
        allowNull: false,
        defaultValue: 'UNREAD',
      },
    },
    {
      sequelize,
      modelName: 'UserNotif',
      tableName: 'UserNotif',
      freezeTableName: true,
    },
  );
  return UserNotif;
};
