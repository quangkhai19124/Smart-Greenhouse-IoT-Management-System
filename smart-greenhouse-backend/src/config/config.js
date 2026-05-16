require('dotenv').config();

module.exports = {
  development: {
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '2210510',
    database: process.env.MYSQL_DATABASE || 'IOT',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
  },
};
