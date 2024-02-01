// api/v1/models/User.js

const { appConfig: { userLevels } } = require('../../../config/appConfig');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        kSelf: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: DataTypes.STRING,
        passwordHash: DataTypes.STRING,
        isDailyReportEnabled: DataTypes.BOOLEAN,
        userLevel: DataTypes.ENUM(...userLevels),
        resetToken: {
            type: DataTypes.STRING, 
            allowNull: true, 
        },
        resetTokenExpires: {
            type: DataTypes.DATE, 
            allowNull: true, 
        },
        loginAttempts: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'User',
        timestamps: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    return User;
};