'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('User', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('User', 'resetTokenExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('User', 'resetToken');
    await queryInterface.removeColumn('User', 'resetTokenExpires');
  }
};
