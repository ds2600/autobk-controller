'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const passwordHash = bcrypt.hashSync('p@ssw0rd', 10);

    return queryInterface.bulkInsert('User', [{
      email: 'admin@example.com',
      passwordHash: passwordHash,
      isDailyReportEnabled: false,
      userLevel: 'Administrator'
    }], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('User', { email: 'admin@example.com' }, {});
  }
};
