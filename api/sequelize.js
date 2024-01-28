// api/sequelize.js
require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize =  new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
    }
);

module.exports =  sequelize;