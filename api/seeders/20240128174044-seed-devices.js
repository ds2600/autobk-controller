'use strict';

const config = require('../../config.json');
const deviceTypeValues = config.deviceTypes.map(type => type.dbValue);

function getRandomDeviceType() {
  const randomIndex = Math.floor(Math.random() * deviceTypeValues.length);
  return deviceTypeValues[randomIndex];
}

function generateRandomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const devices = [];
    for (let i = 1; i <= 25; i++) {
      devices.push({
        sName: `Device ${i}`,
        sType: getRandomDeviceType(),
        sIP: generateRandomIP(),
        iAutoDay: Math.floor(Math.random() * 7), 
        iAutoHour: Math.floor(Math.random() * 24), 
        iAutoWeeks: Math.floor(Math.random() * 4) + 1, 
      });
    }

    return queryInterface.bulkInsert('Device', devices, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Device', null, {});
  }
};
