'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Backup', 'backupHash', {
      type: Sequelize.STRING(64),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Backup', 'backupHash');
  }
};
