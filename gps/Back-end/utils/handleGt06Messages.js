const axios = require('axios');
const { handleSpeedAlerts } = require('./handleSpeedAlerts');
const { handleDeviceData } = require('./handleDeviceData');

async function handleGt06Messages(gt06) {
  for (const msg of gt06.msgBuffer) {
    mqttClient.publish(`${rootTopic}/${gt06.imei}/pos`, JSON.stringify(msg));

    if (gt06.event.string === 'location') {
      const gpsTime = new Date();
      const localTime = new Date(gpsTime.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      const localTimeISO = localTime.toISOString();

      await handleSpeedAlerts(gt06, localTimeISO);
      await handleDeviceData(gt06, localTimeISO);
    }
  }
}

module.exports = { handleGt06Messages };