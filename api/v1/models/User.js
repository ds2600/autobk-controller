// api/v1/models/User.js

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
        userLevel: DataTypes.ENUM('Administrator', 'User', 'Basic')
    }, {
        tableName: 'User',
        timestamps: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    return User;
};