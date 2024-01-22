// api/v1/controllers/deviceController.js

const Sequelize = require('sequelize');
const Device = require('../models/Device');
const Backup = require('../models/Backup');
const Schedule = require('../models/Schedule');
const config = require('../../../config');

/**
 * Retrieves a list of all devices.
 * 
 * @param {string} [type='all'] - Optional. The type of devices to retrieve. Default is 'all'.
 * @returns {Promise<Array>} A promise that resolves to an array of device objects.
 */
exports.getDeviceList = async (type = 'all') => {
    try {
        const devices = await Device.findAll({
            order: [['sName', 'ASC']],
        });

        return await Promise.all(devices.map(async (device) => {
            const latestBackup = await Backup.findOne({
                where: { kDevice: device.kSelf },
                order: [['tComplete', 'DESC']],
                limit: 1
            });

            const nextSchedule = await Schedule.findOne({
                where: { kDevice: device.kSelf, sState: { [Sequelize.Op.not]: ['Fail', 'Complete'] } },
                order: [['tTime', 'ASC']],
                limit: 1
            });

            return {
                deviceId: device.kSelf,
                name: device.sName,
                type: device.sType,
                ip: device.sIP,
                latestBackup: latestBackup ? {
                    fileId: latestBackup.kSelf,
                    completionTime: latestBackup.tComplete,
                    expirationTime: latestBackup.tExpires,
                    fileName: latestBackup.sFile,
                    comment: latestBackup.sComment
                } : null,
                nextSchedule: nextSchedule ? {
                    scheduleId: nextSchedule.kSelf,
                    state: nextSchedule.sState,
                    scheduledTime: nextSchedule.tTime,
                    attemptCount: nextSchedule.iAttempt,
                    comment: nextSchedule.sComment
                } : null
            };
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Retrieves information about a specific device by its ID.
 * 
 * @param {number} deviceId - The ID of the device to retrieve information for.
 * @returns {Promise<Object>} A promise that resolves to an object containing the device's information.
 */
exports.getDeviceInfo = async (deviceId) => {
    try {
        const device = await Device.findByPk(deviceId);

        if (!device) {
            throw new Error('Device not found');
        }

        const deviceInfo = {
            deviceId: device.kSelf,
            name: device.sName,
            type: device.sType,
            ip: device.sIP,
            autoDay: device.iAutoDay,
            autoHour: device.iAutoHour,
            autoWeeks: device.iAutoWeeks
        };

        // If the device type is OneNet, find and add its OneNetLog device
        if (device.sType === 'OneNet') {
            const logDevice = await Device.findOne({
                where: { sName: `${device.sName}-Log`, sType: 'OneNetLog' }
            });

            if (logDevice) {
                deviceInfo.oneNetLog = {
                    logDeviceId: logDevice.kSelf,
                    logDeviceName: logDevice.sName,
                };
            }
        }

        // If device is OneNetLog, add its parent OneNet device info
        if (device.sType === 'OneNetLog') {
            const parentDeviceName = device.sName.replace("-Log", "");
            const parentDevice = await Device.findOne({
                where: { sName: parentDeviceName, sType: 'OneNet' }
            });

            if (parentDevice) {
                deviceInfo.parentOneNet = {
                    parentDeviceId: parentDevice.kSelf,
                    parentDeviceName: parentDevice.sName
                };
            }
        }

        return deviceInfo;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Retrieves all backups for a specific device.
 * 
 * @param {number} deviceId - The ID of the device to retrieve backups for.
 * @returns {Promise<Array>} A promise that resolves to an array of backup objects.
 */
exports.getAllBackups = async (deviceId) => {
    try {
        const backups = await Backup.findAll({
            where: { kDevice: deviceId },
            order: [['tComplete', 'DESC']]
        });

        return await Promise.all(backups.map(async (backup) => {
            return {
                fileId: backup.kSelf,
                completionTime: backup.tComplete,
                expirationTime: backup.tExpires,
                fileName: backup.sFile,
                comment: backup.sComment
            };
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Adds a new device with the provided data.
 * 
 * @param {Object} deviceData - The data for the new device.
 * @returns {Promise<Object>} A promise that resolves to the newly added device object.
 * @throws {Error} Throws an error if the device type is invalid or other validation fails.
 */
exports.addDevice = async (deviceData) => {
    try {

        const validTypes = config.deviceTypes.map(type => type.dbValue);
        if (!validTypes.includes(deviceData.type)) {
            throw new Error('Invalid device type');
        }

        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(deviceData.ip)) {
            throw new Error('Invalid IP address');
        }

        if (deviceData.autoDay < 1 || deviceData.autoDay > 7) {
            throw new Error('autoDay must be between 1 and 7');
        }

        if (deviceData.autoHour < 0 || deviceData.autoHour > 24) {
            throw new Error('autoHour must be between 0 and 24');
        }

        const newDeviceData = {
            sName: deviceData.name,
            sType: deviceData.type,
            sIP: deviceData.ip,
            iAutoDay: deviceData.autoDay,
            iAutoHour: deviceData.autoHour,
            iAutoWeeks: deviceData.autoWeeks
        };

        const newDevice = await Device.create(newDeviceData);
        
        if (newDeviceData.sType === 'OneNet') {
            const logDeviceData = {
                sName: `${newDeviceData.sName}-Log`,
                sType: 'OneNetLog',
                sIP: newDeviceData.sIP,
                iAutoDay: newDeviceData.iAutoDay,
                iAutoHour: newDeviceData.iAutoHour,
                iAutoWeeks: 5 // Fixed value for log backups
            };

            await Device.create(logDeviceData);
        }

        return {
            deviceId: newDevice.kSelf,
            name: newDevice.sName,
            type: newDevice.sType,
            ip: newDevice.sIP,
            autoDay: newDevice.iAutoDay,
            autoHour: newDevice.iAutoHour,
            autoWeeks: newDevice.iAutoWeeks
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Adds a new device with the provided data.
 * 
 * @param {Object} deviceData - The data for the new device.
 * @returns {Promise<Object>} A promise that resolves to the newly added device object.
 * @throws {Error} Throws an error if the device type is invalid or other validation fails.
 */
exports.updateDevice = async (deviceId, deviceData) => {
    try {
        const device = await Device.findByPk(deviceId);
        if (!device) {
            throw new Error('Device not found');
        }

        // Prevent changing device type
        if (deviceData.type && deviceData.type !== device.sType) {
            throw new Error('Cannot change device type');
        }

        // For OneNetLog devices, restrict updates to timing
        if (device.sType === 'OneNetLog') {
            const { autoDay, autoHour, autoWeeks } = deviceData;
        } else {
            await device.update(deviceData);

            // If the device is a OneNet device, update its OneNetLog device
            if (device.sType === 'OneNet') {
                const logDevice = await Device.findOne({
                    where: { sName: `${device.sName}-Log`, sType: 'OneNetLog' }
                });

                if (logDevice) {
                    const logUpdateData = {
                        sName: `${deviceData.name || device.sName}-Log`,
                        sIP: updateData.ip || device.sIP,
                    };
                    await logDevice.update(logUpdateData);
                }
            }
        }

        // TODO: Validate and sanitize input

        await device.update(deviceData);

        return {
            deviceId: device.kSelf,
            name: device.sName,
            ip: device.sIP,
            autoDay: device.iAutoDay,
            autoHour: device.iAutoHour,
            autoWeeks: device.iAutoWeeks
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Retrieves the ID of the OneNetLog device corresponding to a given OneNet device name.
 * 
 * @param {string} deviceName - The name of the OneNet device.
 * @returns {Promise<number>} A promise that resolves to the ID of the OneNetLog device.
 * @throws {Error} Throws an error if the OneNetLog device is not found.
 */
const getEasLogId = async (deviceName) => {
    try {
        const easLogName = `${deviceName}-Log`;
        const logId = await Device.findOne({
            where: { sName: easLogName, sType: 'OneNetLog' }
        });

        return logId.kSelf;
    } catch (error) {
        console.error(error);
        throw error;
    }
}