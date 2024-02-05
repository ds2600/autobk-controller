// api/v1/controllers/deviceController.js

const Sequelize = require('sequelize');
const { Device, Backup, Schedule } = require('../models');
const { appConfig } = require('../../../config/appConfig.js');
const { createLogger } = require('../../../config/logConfig.js')
const logger = createLogger('deviceController');


const deviceController = {
    /**
     * Retrieves a list of all devices.
     * 
     * @param {string} [type='all'] - Optional. The type of devices to retrieve. Default is 'all'.
     * @returns {Promise<Array>} A promise that resolves to an array of device objects.
     */
    async getDeviceList(type = 'all') {
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
            logger.error('Error getting device list: ' + error);
            throw error;
        }
    },

    /**
     * Retrieves information about a specific device by its ID.
     * 
     * @param {number} deviceId - The ID of the device to retrieve information for.
     * @returns {Promise<Object>} A promise that resolves to an object containing the device's information.
     */
    async getDeviceInfo(deviceId) {
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
            logger.error('Error getting device info: ' + error);
            throw error;
        }
    },

    /**
     * Retrieves all backups for a specific device.
     * 
     * @param {number} deviceId - The ID of the device to retrieve backups for.
     * @returns {Promise<Array>} A promise that resolves to an array of backup objects.
     */
    async getAllBackups(deviceId) {
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
            logger.error('Error getting backups: ' + error);
            throw error;
        }
    },

    /**
     * Adds a new device with the provided data.
     * 
     * @param {Object} deviceData - The data for the new device.
     * @returns {Promise<Object>} A promise that resolves to the newly added device object.
     * @throws {Error} Throws an error if the device type is invalid or other validation fails.
     */
    async addDevice(deviceData) {
        try {

            const validTypes = appConfig.deviceTypes.map(type => type.dbValue);
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
            logger.info(`Created new device: ${newDeviceData.sName}`);
            
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
                logger.info(`Created OneNetLog device for ${newDeviceData.sName}`);
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
            logger.error('Error adding device: ' + error);
            throw error;
        }
    },

    /**
     * Updates device with the provided data.
     * 
     * @param {Object} deviceId - The unique ID of the device to update.
     * @param {Object} deviceData - The data for the updated device.
     * @returns {Promise<Object>} A promise that resolves to the newly added device object.
     * @throws {Error} Throws an error if the device type is invalid or other validation fails.
     */
    async updateDevice(deviceId, deviceData) {
        try {
            const device = await Device.findByPk(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            // Map API Fields to DB Fields
            const updateData = {};
            if (deviceData.name) updateData.sName = deviceData.name;

            // For OneNetLog devices, restrict updates to timing
            if (device.sType === 'OneNetLog') {
                const { autoDay, autoHour, autoWeeks } = deviceData;
            } 

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
                    logger.info(`Updating OneNetLog device: ${logUpdateData.sName}`);
                    await logDevice.update(logUpdateData);
                }
            }

            // TODO: Validate and sanitize input
            logger.info(`Updating device: ${updateData.sName}`);
            await device.update(updateData);

            return {
                deviceId: device.kSelf,
                name: device.sName,
                ip: device.sIP,
                autoDay: device.iAutoDay,
                autoHour: device.iAutoHour,
                autoWeeks: device.iAutoWeeks
            };
        } catch (error) {
            logger.error('Error updating device: ' + error);
            throw error;
        }
    },

    /**
     * Retrieves the ID of the OneNetLog device corresponding to a given OneNet device name.
     * 
     * @param {string} deviceName - The name of the OneNet device.
     * @returns {Promise<number>} A promise that resolves to the ID of the OneNetLog device.
     * @throws {Error} Throws an error if the OneNetLog device is not found.
     */
    async getEasLogId(deviceName) {
        try {
            const easLogName = `${deviceName}-Log`;
            const logId = await Device.findOne({
                where: { sName: easLogName, sType: 'OneNetLog' }
            });

            return logId.kSelf;
        } catch (error) {
            logger.error('Error getting EAS log ID: ' + error);
            throw error;
        }
    },

    /**
     * Deletes a device and all associated backups and schedules.
     * 
     * @param {number} deviceId - The ID of the device to delete.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    async deleteDevice(deviceId) {
        try {
            logger.info(`Beginning delete device process: ${deviceId}`)
            const device = await Device.findByPk(deviceId);
            if (!device) {
                logger.warning(`Device not found: ${deviceId}`);
                throw new Error('Device not found');
            }

            // Delete all associated backups
            logger.info(`Deleting backups for device: ${deviceId}`);
            await Backup.destroy({
                where: { kDevice: deviceId }
            });

            // Delete all associated schedules
            logger.info(`Deleting schedules for device: ${deviceId}`);
            await Schedule.destroy({
                where: { kDevice: deviceId }
            });

            // Finally, delete the device
            logger.info(`Deleting device: ${deviceId}`);
            await device.destroy();
            logger.info(`Device deleted: ${deviceId}`);
        } catch (error) {
            logger.error('Error deleting device: ' + error); 
            throw error;
        }
    },
};

module.exports = deviceController;