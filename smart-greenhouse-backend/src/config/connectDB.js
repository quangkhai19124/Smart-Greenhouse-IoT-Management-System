import { Sequelize } from 'sequelize';

console.log('DB USER =', process.env.MYSQL_USER);

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  },
);

// test connection
const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (err) {
    console.log('Unable to connect to the database: ', err);
  }
};
module.exports = {
  connection,
};
