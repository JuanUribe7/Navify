const express = require('express');
const router = express.Router();
const { Device, DeviceStatus} = require('../models/Device'); // Asegúrate de importar DeviceStatus
const Alert = require('../models/Alert'); 
const HistoryData = require('../models/HistoryData'); // Importa HistoryData desde HistoryData.js
const Notification = require('../models/notification');

// Endpoint para obtener todos los dispositivos
router.get('/', async (req, res) => {
    try {
        const dispositivos = await Device.find();
        res.json(dispositivos);
    } catch (error) {
        console.error('Error al obtener dispositivos:', error.message);
        res.status(500).json({ error: 'Error al obtener dispositivos: ' + error.message });
    }
});


router.post('/save-history', async (req, res) => {
    try {
        const { imei, fixTime, lat, lon, speed } = req.body;

        // Verificar que todos los datos requeridos estén presentes
        if (!imei || lat === undefined || lon === undefined) {
            return res.status(400).json({ error: 'IMEI, latitud y longitud son obligatorios.' });
        }
        const dispositivo = await Device.findOne({ imei });
        if (!dispositivo) {
            return res.status(404).json({ message: 'Dispositivo no encontrado' });
        }

        // Crear un nuevo registro de historial
        const historyData = new HistoryData({
            imei,
            fixTime: fixTime,
            lat,
            lon,
            speed
        });

        // Guardar el registro en la base de datos
        await historyData.save();

        res.status(201).json({ message: 'Datos históricos guardados exitosamente.' });
    } catch (error) {
        console.error('Error al guardar datos históricos:', error);
        res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
    }
});

// Endpoint para actualizar la ubicación del dispositivo desde el GPS
router.post('/update-from-gps', async (req, res) => {
    try {
        const { imei, Lat, Lon, speed, course, time, ignition, charging, gpsTracking, relayState } = req.body;

        // Verificar que todos los datos requeridos estén presentes
        if (!imei || Lat === undefined || Lon === undefined) {
            return res.status(400).json({ error: 'IMEI, latitud y longitud son obligatorios.' });
        }

        // Encontrar el dispositivo por IMEI
        const dispositivo = await Device.findOne({ imei });
        if (!dispositivo) {
            return res.status(404).json({ message: 'Dispositivo no encontrado' });
        }

        // Crear o actualizar el estado del dispositivo
        await DeviceStatus.findOneAndUpdate(
            { imei },
            {
                imei,
                fixTime: time,
                lat: Lat,
                lon: Lon,
                speed,
                course,
                ignition,
                charging,
                gpsTracking,
                relayState
            },
            { upsert: true, new: true }
        );
        console.log(`Velocidad actual: ${speed} km/h`);

        

        console.log(`Ubicación actualizada para IMEI: ${imei} - Latitud: ${Lat}, Longitud: ${Lon}`);
        res.json({ message: 'Ubicación actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la ubicación:', error.message);
        res.status(500).json({ error: 'Error al actualizar la ubicación: ' + error.message });
    }
});

// Endpoint para agregar un nuevo dispositivo
router.post('/', async (req, res) => {
    try {
        const { deviceName, responsible, imei, phoneNumber } = req.body;

        if (!deviceName || !responsible || !imei) {
            return res.status(400).json({ error: 'Los campos deviceName, responsible e imei son obligatorios.' });
        }

        const nuevoDispositivo = new Device({
            deviceName,
            responsible,
            imei,
            phoneNumber,
            routeId: 'Ruta no asignada', 
            geozoneId:  'Geozona no asignada' 
        });

        const dispositivoGuardado = await nuevoDispositivo.save();
        res.status(201).json(dispositivoGuardado);
    } catch (error) {
        console.error('Error al agregar dispositivo:', error.message);
        res.status(500).json({ error: 'Error al agregar dispositivo: ' + error.message });
    }
});
// Endpoint para actualizar un dispositivo existente
router.put('/:id', async (req, res) => {
    try {
        const { deviceName, responsible, imei, phoneNumber } = req.body;

        if (!deviceName || !responsible || !imei) {
            return res.status(400).json({ error: 'Los campos deviceName, responsible e imei son obligatorios.' });
        }

        const dispositivoActualizado = await Device.findByIdAndUpdate(
            req.params.id,
            { deviceName, responsible, imei, phoneNumber },
            { new: true }
        );

        if (!dispositivoActualizado) {
            return res.status(404).json({ message: 'Dispositivo no encontrado' });
        }

        res.json(dispositivoActualizado);
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error.message);
        res.status(500).json({ error: 'Error al actualizar dispositivo: ' + error.message });
    }
});

// Endpoint para obtener el estado de un dispositivo por IMEI
router.get('/status/:imei', async (req, res) => {
    try {
        const { imei } = req.params;
        const deviceStatus = await DeviceStatus.findOne({ imei });
        if (!deviceStatus) {
            return res.status(404).json({ message: 'Estado del dispositivo no encontrado' });
        }
        res.json(deviceStatus);
    } catch (error) {
        console.error('Error al obtener el estado del dispositivo:', error.message);
        res.status(500).json({ error: 'Error al obtener el estado del dispositivo: ' + error.message });
    }
});

// Endpoint para obtener el historial de un dispositivo por IMEI
router.get('/history/:imei', async (req, res) => {
    try {
        const { imei } = req.params;
        const { startDate, endDate } = req.query;

        // Verificar que los parámetros startDate y endDate estén presentes
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Los parámetros startDate y endDate son requeridos.' });
        }

        // Verificar si las fechas son válidas
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas.' });
        }

        // Asegurarse de que la fecha de inicio no sea posterior a la fecha de fin
        if (start > end) {
            return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' });
        }

        // Buscar los datos de historial dentro del rango de fechas
        const historyData = await HistoryData.find({
            imei,
            fixTime: {
                $gte: start,
                $lte: end
            }
        }).sort({ fixTime: 1 });

        // Verificar si se encontraron datos
        if (historyData.length === 0) {
            return res.status(404).json({ error: 'No se encontraron datos de historial para el rango de fechas proporcionado.' });
        }

        res.json(historyData);
    } catch (error) {
        console.error('Error al obtener el historial:', error.message);
        res.status(500).json({ error: 'Error al obtener el historial: ' + error.message });
    }
});
router.put('/geozones/:id', async (req, res) => {
    try {
      const { imeis, name } = req.body; // Extraer el array de IMEIs y el nombre de la geozona
  
      // Verificar que el array de IMEIs no esté vacío
      if (imeis && imeis.length > 0) {
        // Actualizar los dispositivos con el nombre de la geozona
        await Device.updateMany(
          { imei: { $in: imeis } }, // Filtrar dispositivos por los IMEIs proporcionados
          { $set: { geozoneName: name } } // Asignar el nombre de la geozona
        );
      }
  
      res.status(200).json({ message: 'Dispositivos actualizados con éxito' });
    } catch (error) {
      console.error('Error al actualizar los dispositivos:', error);
      res.status(500).json({ error: 'Error al actualizar los dispositivos: ' + error.message, details: error });
    }
  });
  router.put('/update-route/:id', async (req, res) => {
    try {
      const { imeis, name } = req.body; // Extraer el array de IMEIs y el nombre de la ruta
  
      // Verificar que el array de IMEIs no esté vacío joa
      if (imeis && imeis.length > 0) {
        // Actualizar los dispositivos con el nombre de la ruta
        await Device.updateMany(
          { imei: { $in: imeis } }, // Filtrar dispositivos por los IMEIs proporcionados
          { $set: { routeName: name } },
          { runValidators: false }  // Asignar el nombre de la ruta
        );
      }
  
      res.status(200).json({ message: 'Dispositivos actualizados con éxito' });
    } catch (error) {
      console.error('Error al actualizar los dispositivos:', error);
      res.status(500).json({ error: 'Error al actualizar los dispositivos: ' + error.message, details: error });
    }
  });




router.get('/alerts/:imei', async (req, res) => {
    try {
        const { imei } = req.params;
        const alertas = await Alert.find({ imei });
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
    }
});
router.get('/alerts/', async (req, res) => {
    try {
        const alertas = await Alert.find();
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
    }
});


// Endpoint para eliminar un dispositivo
router.delete('/:id', async (req, res) => {
    try {
        const dispositivoEliminado = await Device.findByIdAndDelete(req.params.id);

        if (!dispositivoEliminado) {
            return res.status(404).json({ message: 'Dispositivo no encontrado' });
        }

        res.json({ message: 'Dispositivo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar dispositivo:', error.message);
        res.status(500).json({ error: 'Error al eliminar dispositivo: ' + error.message });
    }
});

module.exports = router;