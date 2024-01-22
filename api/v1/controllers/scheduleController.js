// api/v1/controllers/scheduleController.js

const Sequelize = require('sequelize');
const { Schedule, Device } = require('../models');

/**
 * Retrieves all schedules from the database along with the corresponding device names.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of schedule objects with custom naming.
 * @throws {Error} Throws an error if there is an issue retrieving the schedules.
 */
exports.getAllSchedules = async () => {
    try {
        const schedules = await Schedule.findAll({
            where: {
                sState: {
                    [Sequelize.Op.not]: ['Fail', 'Complete']
                }
            },
            include: [{
                model: Device,
                as: 'Device',
                attributes: ['sName']
            }],
        });

        return schedules.map(schedule => ({
            scheduleId: schedule.kSelf,
            deviceId: schedule.kDevice,
            deviceName: schedule.Device.sName,
            state: schedule.sState,
            scheduledTime: schedule.tTime,
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Retrieves all scheduled backups for a specific device.
 * 
 * @param {number} deviceId - The ID of the device to retrieve scheduled backups for.
 * @returns {Promise<Array>} A promise that resolves to an array of scheduled backup objects.
 */
exports.getScheduledBackups = async (deviceId) => {
    try {
        const schedules = await Schedule.findAll({
            where: { 
                kDevice: deviceId,
                sState: {
                    [Sequelize.Op.not]: ['Fail', 'Complete']
                }
            },
            order: [['tTime', 'ASC']]
        });

        return await Promise.all(schedules.map(async (schedule) => {
            return {
                scheduleId: schedule.kSelf,
                state: schedule.sState,
                scheduledTime: schedule.tTime,
                attemptCount: schedule.iAttempt,
                comment: schedule.sComment
            };
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Schedule a backup for a device.
 * 
 * @param {number} deviceId - The ID of the device to schedule the backup for.
 * @param {string} [scheduledTime] - Optional. The time to schedule the backup. 
 *                                   Should be in ISO 8601 format (e.g., "2024-01-26T01:00:00.000Z").
 *                                   If not provided, the current time will be used.
 * @returns {Promise<Object>} The new schedule object.
 */
exports.scheduleBackup = async (deviceId, scheduledTime) => {
    try {
        const dateTime = scheduledTime ? new Date(scheduledTime) : new Date();
        const deviceInfo = await Device.findByPk(deviceId);

        if (deviceInfo && deviceInfo.sType === 'OneNet') {
            // Handle special case for OneNet Devices
            const logId = await getEasLogId(deviceInfo.sName);
            await this.scheduleBackup(logId);
        }

        // Insert new schedule
        const newSchedule = await Schedule.create({
            kDevice: deviceId,
            sState: 'Manual',
            tTime: dateTime.toISOString(),
            sComment: 'Scheduled by user'
        });

        return {
            deviceId: newSchedule.kDevice,
            scheduleId: newSchedule.kSelf,
            scheduledTime: newSchedule.tTime,
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = exports;
