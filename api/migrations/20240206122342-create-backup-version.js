'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BackupVersion', {
      kVersion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      kBackup: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Backup',
          key: 'kSelf'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      sComment: {
        type: Sequelize.STRING(128)
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BackupVersion');
  }
};
