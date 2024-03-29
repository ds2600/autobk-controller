// Application Configuration
const appConfig = {
    deviceTypes: [
      { "dbValue": "APEX", "readableValue": "APEX-1000" },
      { "dbValue": "DCM", "readableValue": "DCM 9902" },
      { "dbValue": "CAP", "readableValue": "CAP 1000" },
      { "dbValue": "Inca1", "readableValue": "Inca 4400" },
      { "dbValue": "Vista", "readableValue": "CableVista" },
      { "dbValue": "OneNet", "readableValue": "Monroe OneNet" },
      { "dbValue": "OneNetLog", "readableValue": "Monroe OneNet(Log)" },
      { "dbValue": "TC600E", "readableValue": "Vecima TC600E" },
      { "dbValue": "CXCHP", "readableValue": "Alpha CXC-HP" },
      { "dbValue": "PSSend", "readableValue": "Sonifex PS-Send" },
      { "dbValue": "Quartet", "readableValue": "Quartet" }
    ],
    userLevels: [
      'Administrator',
      'User',
      'Basic',
    ],
  }
  
  module.exports = { appConfig };