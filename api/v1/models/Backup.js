// api/v1/models/Backup.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
            type: DataTypes.STRING(128),
            allowNull: false
        },
        backupHash: {
            type: DataTypes.STRING(64)
        },
        sComment: {
            type: DataTypes.STRING(128)
        }
    }, {
        tableName: 'Backup',
        timestamps: false
    });

    return Backup;
};
