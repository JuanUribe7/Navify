const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Endpoint para guardar una ruta
router.post('/save-route', async (req, res) => {
  try {
    const { name, waypoints, summary, instructions } = req.body;
    const route = new Route({
      name,
      coordinates: waypoints,
      summary,
      waypoints: waypoints.map(wp => ({ latLng: wp, name: 'Waypoint' })),
      instructions
    });
    await route.save();
    res.status(201).send(route);
  } catch (error) {
    res.status(400).send(error);
  }
});
// Endpoint para obtener una ruta
router.get('/get-route/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    res.json(route);
  } catch (error) {
    console.error('Error al obtener la ruta:', error.message);
    res.status(500).json({ error: 'Error al obtener la ruta: ' + error.message });
  }
});

// Endpoint para obtener todas las rutas
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    console.error('Error al obtener las rutas:', error.message);
    res.status(500).json({ error: 'Error al obtener las rutas: ' + error.message });
  }
});

module.exports = router;