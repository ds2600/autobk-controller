// api/v1/models/Device.js

const { appConfig } = require('../../../config/appConfig.js');
const deviceTypeValues = appConfig.deviceTypes.map(type => type.value);

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
      kSelf: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
      },
      sName: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
      },
      sType: {
          type: DataTypes.ENUM,
          values: deviceTypeValues,
          allowNull: false
        },
        sIP: {
          type: DataTypes.STRING(16),
          allowNull: false
        },
        iAutoDay: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0
        },
        iAutoHour: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0
        },
        iAutoWeeks: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 1
        }
      }, {
        tableName: 'Device',
        timestamps: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
  });

  return Device;
};
