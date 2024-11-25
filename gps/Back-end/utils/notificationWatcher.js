const Notification = require('../models/notification'); // Modelo Mongoose
const { enviarNotificacion } = require('./websocketUtils'); // Importamos la función de envío de notificaciones

const iniciarWatcher = (wss) => { // Recibe la instancia de WebSocket Server
    const changeStream = Notification.watch();

    changeStream.on('change', async (change) => {
        switch (change.operationType) {
            case 'insert': {
                const newNotification = change.fullDocument;
                enviarNotificacion(newNotification, wss); // Pasamos wss al enviarNotificacion
                break;
            }
            case 'update': {
                const updatedNotification = await Notification.findById(change.documentKey._id);
                enviarNotificacion(updatedNotification, wss); // Pasamos wss al enviarNotificacion
                break;
            }
            case 'delete': {
                const deletedNotificationId = change.documentKey._id;
                enviarNotificacion({ _id: deletedNotificationId, deleted: true }, wss); // Notificar eliminación
                break;
            }
            default: {
                console.log(`Operación no manejada: ${change.operationType}`);
            }
        }
    });

    changeStream.on('error', (error) => {
        console.error('Error en el change stream:', error);
    });
};

module.exports = iniciarWatcher;