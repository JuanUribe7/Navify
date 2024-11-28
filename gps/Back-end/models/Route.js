const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  waypoints: [
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Route', RouteSchema);