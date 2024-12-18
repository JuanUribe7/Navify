const Notification = require('../models/notification');
const Alert = require('../models/Alert');

async function createNotificationAndAlert(imei, name, time, type) {
  const notification = new Notification({
    imei,
    notificationName: name,
    notificationTime: time,
    notificationType: type
  });

  const alert = new Alert({
    imei,
    alertName: name,
    alertTime: time,
    alertType: type
  });

  try {
    await notification.save();
    await alert.save();
    console.log(`Notificación de ${type} guardada para IMEI: ${imei}`);
  } catch (error) {
    console.error('Error al guardar la notificación:', error);
  }
}

module.exports = { createNotificationAndAlert };