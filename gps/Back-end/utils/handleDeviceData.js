const axios = require('axios');

async function handleDeviceData(gt06, localTimeISO) {
  const deviceData = {
    imei: gt06.imei,
    Lat: gt06.lat,
    Lon: gt06.lon,
    speed: gt06.speed,
    course: gt06.course,
    time: localTimeISO,
    ignition: gt06.terminalInfo ? Boolean(gt06.terminalInfo.ignition) : false,
    charging: gt06.terminalInfo ? Boolean(gt06.terminalInfo.charging) : false,
    gpsTracking: gt06.terminalInfo ? Boolean(gt06.terminalInfo.gpsTracking) : false,
    relayState: gt06.terminalInfo ? Boolean(gt06.terminalInfo.relayState) : false
  };

  const historyData = {
    imei: gt06.imei,
    lat: gt06.lat,
    lon: gt06.lon,
    speed: gt06.speed,
    course: gt06.course,
    fixTime: localTimeISO
  };

  try {
    await axios.post(`http://54.236.5.204/devices/update-from-gps`, deviceData);
    await axios.post(`http://54.236.5.204/devices/save-history`, historyData);
    console.log(`Datos enviados a /update-from-gps para IMEI: ${gt06.imei}`);
  } catch (error) {
    console.error('Error al enviar los datos:', error);
  }
}

module.exports = { handleDeviceData };