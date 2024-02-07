'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create 'Device' table
    await queryInterface.createTable('Device', {
      kSelf: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      sName: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true
      },
      sType: {
        type: Sequelize.ENUM('APEX', 'FakeDevice', 'DCM', 'CAP', 'Inca1', 'Vista', 'OneNet', 'OneNetLog', 'TC600E', 'CXCHP', 'PSSend', 'Quartet'),
        allowNull: false
      },
      sIP: {
        type: Sequelize.STRING(16),
        allowNull: false
      },
      iAutoDay: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      iAutoHour: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      iAutoWeeks: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1
      }
    });

    // Create 'Backup' table
    await queryInterface.createTable('Backup', {
      kSelf: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      kDevice: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Device',
          key: 'kSelf'
        }
      },
      tComplete: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sFile: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      sComment: {
        type: Sequelize.STRING(128),
        allowNull: true
      }
    });

    // Create 'Schedule' table
    await queryInterface.createTable('Schedule', {
      kSelf: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      kDevice: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Device',
          key: 'kSelf'
        }
      },
      sState: {
        type: Sequelize.ENUM('Auto', 'Manual', 'Fail', 'Complete'),
        allowNull: false
      },
      tTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      iAttempt: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      sComment: {
        type: Sequelize.STRING(128),
        allowNull: true
      }
    });

    // Create 'User' table
    await queryInterface.createTable('User', {
      kSelf: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      isDailyReportEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      userLevel: {
        type: Sequelize.ENUM('Administrator', 'User', 'Basic'),
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('User');
    await queryInterface.dropTable('Schedule');
    await queryInterface.dropTable('Backup');
    await queryInterface.dropTable('Device');
  }
};
