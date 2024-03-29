// api/v1/models/Schedule.js

module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
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
        sState: {
            type: DataTypes.ENUM('Auto', 'Manual', 'Fail', 'Complete'),
            allowNull: false
        },
        tTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        iAttempt: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0
        },
        sComment: {
            type: DataTypes.STRING(128)
        }
    }, {
        tableName: 'Schedule',
        timestamps: false
    });

    return Schedule;
};
