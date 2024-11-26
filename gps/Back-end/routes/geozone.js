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