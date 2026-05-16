'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Users.belongsToMany(models.Notification, {
        through: models.UserNotif,
        foreignKey: 'userID',
        otherKey: 'notifID',
      });
    }
  }
  Users.init(
    {
      role: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      status: DataTypes.STRING,
      teleChatID: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Users',
    },
  );
  return Users;
};
