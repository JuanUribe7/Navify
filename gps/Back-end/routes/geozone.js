const express = require('express');
const router = express.Router();
const Geozone = require('../models/Geozone');
const Device = require('../models/Device'); 
// Endpoint POST para guardar una geozona en la base de datos
router.post('/geozones', async (req, res) => {
    try {
      const { imeis, ...geozoneData } = req.body; // Extraer el array de IMEIs y los datos de la geozona
      const geozone = new Geozone(geozoneData);
      await geozone.save();
  
      // Actualizar los dispositivos con el nombre de la geozona
      res.status(201).json(geozone);
    } catch (error) {
      console.error('Error al guardar la geozona:', error.message);
      res.status(500).json({ error: 'Error al guardar la geozona: ' + error.message });
    }
  });
  // Endpoint PUT para actualizar una geozona y asignar dispositivos
  router.put('/geozones/:id', async (req, res) => {
    try {
      const { imeis, name } = req.body; // Extraer el array de IMEIs y el nombre de la geozona
  
      // Verificar que el array de IMEIs no esté vacío
      if (imeis && imeis.length > 0) {
        // Crear operaciones de actualización para cada IMEI
        const bulkOps = imeis.map(imei => ({
          updateOne: {
            filter: { imei: imei },
            update: { $set: { geozoneName: name } }
          }
        }));
  
        // Ejecutar las operaciones de actualización en bloque
        await Device.bulkWrite(bulkOps);
      }
  
      res.status(200).json({ message: 'Dispositivos actualizados con éxito' });
    } catch (error) {
      console.error('Error al actualizar los dispositivos:', error);
      res.status(500).json({ error: 'Error al actualizar los dispositivos: ' + error.message, details: error });
    }
  });
  


// Endpoint GET para buscar y enviar las geozonas desde la base de datos
router.get('/geozones', async (req, res) => {
  try {
    const geozones = await Geozone.find();
    res.status(200).json(geozones);
  } catch (error) {
    console.error('Error al obtener las geozonas:', error.message);
    res.status(500).json({ error: 'Error al obtener las geozonas: ' + error.message });
  }
});

module.exports = router;