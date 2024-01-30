'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('User', 'isLocked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, 
    });

    await queryInterface.addColumn('User', 'loginAttempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('User', 'isLocked');
    await queryInterface.removeColumn('User', 'loginAttempts');
  },
};
