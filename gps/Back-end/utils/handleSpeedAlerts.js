const { createNotificationAndAlert } = require('./createNotificationAndAlert');

const BRAKING_THRESHOLD = 30;
let previousSpeed = 0;

async function handleSpeedAlerts(gt06, localTimeISO) {
  if (gt06.speed > 35) {
    console.log(`Velocidad de ${gt06.speed} km/h detectada, creando alerta...`);
    await createNotificationAndAlert(gt06.imei, `Exceso de velocidad: ${gt06.speed} km/h`, localTimeISO, 'maxSpeed');
  }

  if (previousSpeed - gt06.speed >= BRAKING_THRESHOLD && previousSpeed >= 30) {
    console.log(`Frenado brusco detectado, creando alerta...`);
    await createNotificationAndAlert(gt06.imei, `Frenado brusco: de ${previousSpeed} km/h a ${gt06.speed} km/h`, localTimeISO, 'hardBraking');
  }

  previousSpeed = gt06.speed;
}

module.exports = { handleSpeedAlerts };