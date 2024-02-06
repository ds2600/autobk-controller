// api/v1/models/BackupVersion.js

module.exports = (sequelize, DataTypes) => {
    const BackupVersion = sequelize.define('BackupVersion', {
        kVersion: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        kBackup: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'Backup',
                key: 'kSelf'
            }
        },
        versionNumber: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        sComment: {
            type: DataTypes.STRING(128)
        }
    }, {
        tableName: 'BackupVersion',
        timestamps: false
    });

    return BackupVersion;
};
