// api/models/Backup.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../sequelize');

const Backup = sequelize.define('Backup', {
    kSelf: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    kDevice: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    tComplete: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tExpires: {
        type: DataTypes.DATE
    },
    sFile: {
        type: DataTypes.STRING(65),
        allowNull: false
    },
    sComment: {
        type: DataTypes.STRING(128)
    }
}, {
    tableName: 'Backup',
    timestamps: false
});

module.exports = Backup;
